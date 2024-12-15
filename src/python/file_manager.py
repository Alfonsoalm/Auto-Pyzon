import os
import hashlib
import argparse
from datetime import datetime

# === Función para calcular hash de un archivo ===
def calculate_hash(file_path, chunk_size=8192):
    """
    Calcula el hash MD5 de un archivo para identificar duplicados.
    """
    try:
        hash_md5 = hashlib.md5()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(chunk_size), b""):
                hash_md5.update(chunk)
        return hash_md5.hexdigest()
    except Exception as e:
        return f"Error al calcular hash para {file_path}: {str(e)}"

# === Función para encontrar archivos duplicados ===
def find_duplicates(folder_path):
    """
    Encuentra archivos duplicados en una carpeta.
    """
    try:
        hashes = {}
        for root, _, files in os.walk(folder_path):
            for file in files:
                file_path = os.path.join(root, file)
                file_hash = calculate_hash(file_path)
                if "Error" in file_hash:
                    print(file_hash)  # Imprime el error si ocurre durante el cálculo del hash
                    continue
                if file_hash in hashes:
                    hashes[file_hash].append(file_path)
                else:
                    hashes[file_hash] = [file_path]
        duplicates = {k: v for k, v in hashes.items() if len(v) > 1}
        return duplicates
    except Exception as e:
        return f"Error al buscar duplicados: {str(e)}"

# === Función para organizar archivos por tipo ===
def organize_files(folder_path):
    """
    Organiza archivos en subcarpetas basadas en su extensión.
    """
    try:
        if not os.path.exists(folder_path):
            return "La carpeta no existe."

        for root, _, files in os.walk(folder_path):
            for file in files:
                file_path = os.path.join(root, file)
                file_extension = file.split('.')[-1]
                folder_name = os.path.join(folder_path, file_extension.lower())
                os.makedirs(folder_name, exist_ok=True)
                new_file_path = os.path.join(folder_name, file)
                os.rename(file_path, new_file_path)
        return "Archivos organizados por tipo."
    except Exception as e:
        return f"Error al organizar archivos: {str(e)}"

# === Función para renombrar archivos ===
def rename_files(folder_path, mode, prefix="", suffix="", replace_text=None, replace_with=None):
    """
    Renombra archivos en una carpeta según el modo especificado.
    """
    try:
        if not os.path.exists(folder_path):
            return "La carpeta especificada no existe."

        files = [f for f in os.listdir(folder_path) if os.path.isfile(os.path.join(folder_path, f))]

        if not files:
            return "No se encontraron archivos en la carpeta."

        for i, filename in enumerate(files):
            file_path = os.path.join(folder_path, filename)
            file_name, file_extension = os.path.splitext(filename)

            # Generar el nuevo nombre basado en el modo seleccionado
            if mode == "sequential":
                new_name = f"{prefix}{i + 1:03d}{suffix}{file_extension}"
            elif mode == "creation_date":
                creation_time = os.path.getctime(file_path)
                formatted_date = datetime.fromtimestamp(creation_time).strftime("%Y-%m-%d")
                new_name = f"{prefix}{formatted_date}{suffix}{file_extension}"
            elif mode == "custom":
                new_name = f"{prefix}{file_name}{suffix}"
                if replace_text and replace_with:
                    new_name = new_name.replace(replace_text, replace_with)
            else:
                continue

            # Renombrar el archivo
            new_file_path = os.path.join(folder_path, new_name)
            os.rename(file_path, new_file_path)
        return "Renombrado completado."
    except Exception as e:
        return f"Error al renombrar archivos: {str(e)}"

# === Manejo de argumentos ===
if __name__ == "__main__":
    try:
        parser = argparse.ArgumentParser(description="Gestión de Archivos")
        parser.add_argument("--task", choices=["organize", "duplicates", "rename"], help="Tarea a realizar.")
        parser.add_argument("--folder", required=True, help="Ruta de la carpeta.")
        parser.add_argument("--mode", help="Modo para renombrar archivos: sequential, creation_date, custom.")
        parser.add_argument("--prefix", default="", help="Prefijo para el nombre del archivo.")
        parser.add_argument("--suffix", default="", help="Sufijo para el nombre del archivo.")
        parser.add_argument("--replace_text", help="Texto a reemplazar en el nombre del archivo.")
        parser.add_argument("--replace_with", help="Texto de reemplazo.")

        args = parser.parse_args()

        if args.task == "organize":
            result = organize_files(args.folder)
            print(result)

        elif args.task == "duplicates":
            duplicates = find_duplicates(args.folder)
            if isinstance(duplicates, str):  # Manejo de errores
                print(duplicates)
            else:
                print("Duplicados encontrados:")
                for hash_key, file_list in duplicates.items():
                    print(f"Hash: {hash_key}")
                    for file in file_list:
                        print(f"  - {file}")
                        
        elif args.task == "rename":
            result = rename_files(
                folder_path=args.folder,
                mode=args.mode,
                prefix=args.prefix,
                suffix=args.suffix,
                replace_text=args.replace_text,
                replace_with=args.replace_with)
            print(result)

    except Exception as e:
        print(f"Error general: {str(e)}")
