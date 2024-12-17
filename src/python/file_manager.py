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


# === Función para encontrar y eliminar archivos duplicados ===
def delete_duplicates(folder_path):
    """
    Encuentra y elimina archivos duplicados en una carpeta.
    Mantiene solo el primer archivo y elimina los duplicados.
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

        if duplicates:
            # print("\nArchivos duplicados encontrados y eliminados:")
            # for hash_key, file_list in duplicates.items():
            #     print(f"Hash: {hash_key}")

            # Eliminar duplicados
            for file_list in duplicates.values():
                for file_path in file_list[1:]:  # Mantener el primer archivo
                    try:
                        os.remove(file_path)
                        # print(f"Eliminado: {file_path}")
                    except Exception as e:
                        print(f"Error al eliminar {file_path}: {str(e)}")

            return "Duplicados eliminados exitosamente."
        else:
            return "No se encontraron duplicados."

    except Exception as e:
        return f"Error al buscar o eliminar duplicados: {str(e)}"


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

        used_names = {}  # Diccionario para manejar nombres duplicados

        for i, filename in enumerate(files):
            file_path = os.path.join(folder_path, filename)
            file_name, file_extension = os.path.splitext(filename)  # Mantener extensión

            # Generar el nuevo nombre basado en el modo seleccionado
            if mode == "sequential":
                new_name = f"{prefix}{i + 1:03d}{suffix}{file_extension}"

            elif mode == "creation_date":
                creation_time = os.path.getctime(file_path)
                formatted_date = datetime.fromtimestamp(creation_time).strftime("%Y-%m-%d")
                base_name = f"{prefix}{formatted_date}{suffix}"
                new_name = f"{base_name}{file_extension}"
                
                # Manejo de nombres duplicados con sufijo numérico
                counter = 1
                while new_name in used_names:
                    new_name = f"{base_name} ({counter}){file_extension}"
                    counter += 1

                used_names[new_name] = True  # Guardar el nombre usado

            elif mode == "custom":
                new_name = f"{prefix}{file_name}{suffix}{file_extension}"
                if replace_text and replace_with:
                    new_name = new_name.replace(replace_text, replace_with)

            else:
                continue

            # Renombrar el archivo
            new_file_path = os.path.join(folder_path, new_name)
            os.rename(file_path, new_file_path)
            print(f"Renombrado: {filename} -> {new_name}")

        return "Renombrado completado."

    except Exception as e:
        return f"Error al renombrar archivos: {str(e)}"


# === Script principal ===
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

        if args.task == "rename":
            result = rename_files(
                folder_path=args.folder,
                mode=args.mode,
                prefix=args.prefix,
                suffix=args.suffix,
                replace_text=args.replace_text,
                replace_with=args.replace_with
            )
            print(result)

    except Exception as e:
        print(f"Error general: {str(e)}")