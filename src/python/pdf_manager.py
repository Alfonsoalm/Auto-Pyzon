import os
from PyPDF2 import PdfReader, PdfWriter, PdfMerger

# === Función para generar nombre de salida ===
def generate_output_name(input_path, suffix="_modify"):
    """Genera un nombre de salida con un sufijo antes de la extensión."""
    base, ext = os.path.splitext(input_path)
    return f"{base}{suffix}{ext}"


# === Función para unir todos los PDFs de una carpeta ===
def merge_pdfs_from_folder(folder_path):
    """Combina todos los PDFs de una carpeta en un unico archivo."""
    merger = PdfMerger()
    try:
        pdf_files = sorted([os.path.join(folder_path, f) for f in os.listdir(folder_path) if f.endswith('.pdf')])

        if not pdf_files:
            return "No se encontraron archivos PDF en la carpeta."

        output_file = generate_output_name(os.path.join(folder_path, "merged.pdf"))

        for pdf in pdf_files:
            merger.append(pdf)

        merger.write(output_file)
        return f"Archivos combinados con exito en '{output_file}'"
    except Exception as e:
        return f"Error al combinar PDFs: {e}"
    finally:
        merger.close()


# === Función para unir páginas seleccionadas de un PDF ===
def merge_selected_pages(input_pdf, page_list):
    """Crea un nuevo PDF combinando solo las paginas especificadas de un archivo."""
    try:
        reader = PdfReader(input_pdf)
        writer = PdfWriter()

        output_pdf = generate_output_name(input_pdf)

        for page_num in page_list:
            if page_num - 1 < 0 or page_num - 1 >= len(reader.pages):
                print(f"Pagina {page_num} fuera de rango.")
            else:
                writer.add_page(reader.pages[page_num - 1])

        with open(output_pdf, "wb") as output_file:
            writer.write(output_file)

        return f"Nuevo PDF creado exitosamente: {output_pdf}"
    except Exception as e:
        return f"Error al procesar el PDF: {e}"


# === Manejo de argumentos ===
if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Gestión de PDFs")
    parser.add_argument("--task", choices=["merge_folder", "merge_pages"], required=True, help="Tarea a realizar.")
    parser.add_argument("--folder", help="Ruta de la carpeta con los PDFs (solo para 'merge_folder').")
    parser.add_argument("--input_pdf", help="Ruta del archivo PDF de entrada (solo para 'merge_pages').")
    parser.add_argument("--page_list", help="Lista de páginas a combinar, separadas por comas (solo para 'merge_pages').")

    args = parser.parse_args()

    if args.task == "merge_folder":
        if not args.folder:
            print("Error: Debes proporcionar una carpeta con --folder.")
        else:
            result = merge_pdfs_from_folder(args.folder)
            print(result)

    elif args.task == "merge_pages":
        if not args.input_pdf or not args.page_list:
            print("Error: Debes proporcionar un archivo PDF de entrada y una lista de páginas.")
        else:
            page_list = list(map(int, args.page_list.split(",")))
            result = merge_selected_pages(args.input_pdf, page_list)
            print(result)
