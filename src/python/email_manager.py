import os
import argparse
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from fpdf import FPDF
import docx
import imaplib
import email
from email.header import decode_header

# Configuraciones SMTP e IMAP por dominio
EMAIL_PROVIDERS = {
    "gmail.com": {
        "smtp_server": "smtp.gmail.com",
        "smtp_port": 587,
        "imap_server": "imap.gmail.com",
        "imap_port": 993
    },
    "outlook.com": {
        "smtp_server": "smtp.office365.com",
        "smtp_port": 587,
        "imap_server": "outlook.office365.com",
        "imap_port": 993
    },
    "hotmail.com": {
        "smtp_server": "smtp.office365.com",
        "smtp_port": 587,
        "imap_server": "outlook.office365.com",
        "imap_port": 993
    },
    "yahoo.com": {
        "smtp_server": "smtp.mail.yahoo.com",
        "smtp_port": 587,
        "imap_server": "imap.mail.yahoo.com",
        "imap_port": 993
    }
}

# === Clase FPDF con soporte de Unicode ===
class PDF(FPDF):
    def __init__(self):
        super().__init__()
        self.add_page()
        self.add_font('DejaVu', '', os.path.join(os.path.dirname(__file__), 'DejaVuSans.ttf'), uni=True)
        self.set_font('DejaVu', size=12)

# Detectar configuración según dominio
def get_email_provider_config(email_address):
    domain = email_address.split("@")[-1]
    return EMAIL_PROVIDERS.get(domain)

# === Función para enviar un solo email ===
def send_email(username, password, to_email, subject, message, cc_email=None, bcc_email=None):
    try:
        provider_config = get_email_provider_config(username)
        if not provider_config:
            raise ValueError(f"Proveedor no soportado para el correo: {username}")

        smtp_server = provider_config["smtp_server"]
        smtp_port = provider_config["smtp_port"]

        msg = MIMEMultipart()
        msg["From"] = username
        msg["To"] = to_email
        msg["Subject"] = subject
        if cc_email:
            msg["Cc"] = cc_email

        msg.attach(MIMEText(message, "plain"))
        recipients = [to_email] + ([cc_email] if cc_email else []) + ([bcc_email] if bcc_email else [])

        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(username, password)
            server.sendmail(username, recipients, msg.as_string())

        print("Correo enviado exitosamente.")
    except Exception as e:
        print(f"Error al enviar correo: {e}")

# === Función para leer emails ===
def read_emails(username, password, number_emails, save_path=".", format="txt"):
    try:
        provider_config = get_email_provider_config(username)
        if not provider_config:
            raise ValueError(f"Proveedor no soportado para el correo: {username}")

        imap_server = provider_config["imap_server"]

        imap = imaplib.IMAP4_SSL(imap_server)
        imap.login(username, password)
        imap.select("inbox")

        status, messages = imap.search(None, "ALL")
        mail_ids = messages[0].split()

        content_list = []
        for i in mail_ids[-number_emails:]:
            res, msg = imap.fetch(i, "(RFC822)")
            for response in msg:
                if isinstance(response, tuple):
                    msg = email.message_from_bytes(response[1])

                    subject, encoding = decode_header(msg["Subject"])[0]
                    if isinstance(subject, bytes):
                        subject = subject.decode(encoding if encoding else "utf-8", errors="replace")
                    subject = subject or "Sin Asunto"

                    from_ = msg.get("From") or "Remitente desconocido"

                    body = ""
                    if msg.is_multipart():
                        for part in msg.walk():
                            if part.get_content_type() == "text/plain" and part.get("Content-Disposition") is None:
                                body = part.get_payload(decode=True).decode("utf-8", errors="replace")
                                break
                    else:
                        payload = msg.get_payload(decode=True)
                        body = payload.decode("utf-8", errors="replace") if payload else ""

                    content = f"De: {from_}\nAsunto: {subject}\n{'-' * 50}\n{body.strip()}"
                    content_list.append(content)

        export_messages(content_list, format, save_path)
        print(f"Correos exportados a {save_path} en formato {format}.")
    except Exception as e:
        print(f"Error al leer correos: {e}")

def sanitize_text(text):
    """ Elimina o reemplaza caracteres problemáticos. """
    return ''.join(c if ord(c) < 128 else ' ' for c in text)

def export_messages(content_list, format, save_path):
    if format == "txt":
        with open(f"{save_path}/emails.txt", "w", encoding="utf-8") as f:
            f.write("\n\n".join(content_list))
    elif format == "pdf":
        pdf = PDF()
        for content in content_list:
            sanitized_content = sanitize_text(content)
            pdf.multi_cell(0, 10, sanitized_content)
        pdf.output(f"{save_path}/emails.pdf")
    elif format == "word":
        doc = docx.Document()
        for content in content_list:
            doc.add_paragraph(content)
        doc.save(f"{save_path}/emails.docx")

# === Main ===
if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--task", choices=["send_email", "read_emails"], required=True)
    parser.add_argument("--username", required=True)
    parser.add_argument("--password", required=True)
    parser.add_argument("--to_email", help="Destinatario del correo.")
    parser.add_argument("--subject", help="Asunto del correo.")
    parser.add_argument("--message", help="Mensaje del correo.")
    parser.add_argument("--number_emails", type=int, help="Cantidad de correos a leer.")
    parser.add_argument("--format", choices=["txt", "pdf", "word"], help="Formato de exportación.")
    parser.add_argument("--save_path", help="Ruta para guardar correos.")

    args = parser.parse_args()

    if args.task == "send_email":
        send_email(args.username, args.password, args.to_email, args.subject, args.message)
    elif args.task == "read_emails":
        read_emails(args.username, args.password, args.number_emails, args.save_path, args.format)
