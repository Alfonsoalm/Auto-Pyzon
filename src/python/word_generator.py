import argparse
import os
import re
import win32com.client
import time
import psutil

# === Función para eliminar instancias previas de Word ===
def kill_word_processes():
    for process in psutil.process_iter(['pid', 'name']):
        if process.info['name'] and "WINWORD.EXE" in process.info['name']:
            print(f"Terminando proceso de Word: PID {process.info['pid']}")
            process.terminate()

# === Función para extraer número del nombre de un archivo ===
def extract_number(file_name):
    match = re.search(r'_(\d+)', file_name)
    return int(match.group(1)) if match else float('inf')

# === Función para combinar tablas de archivos Word en un archivo final ===
def combine_tables(folder_path, output_file="Documento_Combinado", output_format="word"):
    kill_word_processes()  # Cierra instancias previas de Word
    word = win32com.client.Dispatch("Word.Application")
    word.Visible = False
    word.DisplayAlerts = False
    output_document = None

    try:
        output_document = word.Documents.Add()
        docx_files = [file for file in os.listdir(folder_path) if file.endswith(".docx")]
        docx_files = sorted(docx_files, key=extract_number)

        if not docx_files:
            print("No se encontraron archivos .docx en la carpeta.")
            return "No se encontraron archivos Word en la carpeta."

        for file_name in docx_files:
            file_path = os.path.join(folder_path, file_name)
            print(f"Procesando archivo: {file_path}")
            try:
                source_document = word.Documents.Open(file_path, ReadOnly=True)
                for table in source_document.Tables:
                    try:
                        table.Range.Copy()
                        time.sleep(1)  # Retraso tras copiar la tabla
                        output_document.Range(output_document.Content.End - 1).Paste()
                        time.sleep(1)  # Retraso tras pegar
                        output_document.Content.InsertAfter("\n")
                    except Exception as e:
                        print(f"Error al copiar/pegar tabla en {file_name}: {e}")
                source_document.Close(SaveChanges=0)
            except Exception as e:
                print(f"Error al procesar el archivo {file_name}: {e}")

        output_extension = "docx" if output_format == "word" else "pdf"
        output_path = os.path.join(folder_path, f"{output_file}.{output_extension}")

        if output_format == "word":
            output_document.SaveAs(output_path)
        elif output_format == "pdf":
            output_document.SaveAs(output_path, FileFormat=17)
        else:
            raise ValueError("Formato de salida no válido. Use 'word' o 'pdf'.")

        print(f"Archivo combinado guardado en: {output_path}")
        return f"Archivo combinado guardado en: {output_path}"

    except Exception as e:
        print(f"Error general: {e}")
        return f"Error al combinar documentos: {e}"

    finally:
        try:
            if output_document:
                output_document.Close(SaveChanges=0)
            word.Quit()
        except Exception as e:
            print(f"Error al cerrar Word: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Gestor de documentos Word")
    parser.add_argument("--task", choices=["combine_tables"], required=True, help="Tarea a realizar.")
    parser.add_argument("--folder", required=True, help="Ruta de la carpeta que contiene los documentos Word.")
    parser.add_argument("--output_file", default="Documento_Combinado", help="Nombre del archivo de salida.")
    parser.add_argument("--output_format", choices=["word", "pdf"], default="word", help="Formato de salida.")

    args = parser.parse_args()

    if args.task == "combine_tables":
        result = combine_tables(args.folder, args.output_file, args.output_format)
        print(result)
