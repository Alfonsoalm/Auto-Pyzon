# AutoPyzon

**AutoPyzon** es una aplicación de escritorio diseñada para automatizar tareas repetitivas relacionadas con la gestión de archivos y documentos, utilizando la potencia de **Python** para el procesamiento y la interfaz de usuario de **Electron** y **React** para una experiencia amigable.

## 🚀 Funcionalidades

AutoPyzon simplifica diversas tareas de oficina y gestión de archivos, incluyendo:

1. **Creación de informes en Word**:
   - Genera documentos automatizados a partir de plantillas predefinidas.
   - Personaliza contenido dinámicamente, como gráficos, tablas y texto.

2. **Gestión de carpetas**:
   - Renombra carpetas de manera masiva según criterios específicos.
   - Organiza archivos automáticamente en subcarpetas por tipo o fecha.

3. **Separación y Combinacion de PDFs**:
   - Divide archivos PDF en páginas individuales o rangos específicos.
   - Combina varios PDFs en un solo archivo.

4. **Envio, Lectura y Exportacion de correos electronicos de Gmail**:
   - Personaliza envios masivos de correos a diversos destinatarios con estructura fija
   - Leer los correos y filtra a tu gusto.
   - Recoge correos para exportarlos como word o pdf.

5. **Envio, Lectura y Exportacion de mensajes de Whatsapp**:
   - Personaliza envios de mensajes de whatsapp a contactos o grupos incluyendo imagenes
   - Leer los mensajes y filtra a tu gusto.
   - Recoge mensajes de Whatsapp para exportarlos como word o pdf.

5. **Algunas mas en desarrollo**

---

## 🖥️ Tecnologías Utilizadas

- **Frontend**:
  - **Electron**: Para la interfaz de escritorio.
  - **React**: Para la creación de componentes interactivos.

- **Backend**:
  - **Python**: Manejo de lógica de automatización.
  - **Librerías**:
    - `python-docx`: Para manejar documentos Word.
    - `PyPDF2`: Para gestionar PDFs.
    - `yt-dlp`: Para la descarga de videos.
    - `os`, `shutil`: Para manipulación de archivos y carpetas.
    - ...

- **Otras herramientas**:
  - **FFmpeg**: Para la conversión y manipulación de videos.
  - **Whisper**: Para la generación automática de subtítulos.

---

## 📦 Instalación y Uso

### Requisitos Previos

1. **Node.js** y **npm** o **yarn** instalados.
2. **Python** (versión 3.9 o superior) con las librerías necesarias.
3. **FFmpeg** instalado y configurado en el sistema.

### Pasos para instalar

1. Clona este repositorio:
   `bash`
   git clone https://github.com/tu-usuario/AutoPyzon.git
   cd AutoPyzon

2. Instala las dependencias
    yarn install

3. Instala las dependencias de Python (requeridas para las automatizaciones):
    pip install -r requirements.txt

4. Ejecuta la aplicación:
    yarn electron-dev