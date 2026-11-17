# Componentes de terceros

H5PDF (licencia Apache 2.0) usa los componentes siguientes, que conservan sus licencias.

## Versión web (conversión en el navegador)

Se sirven junto a la página, en `vendor/`, con su archivo de licencia.

| Componente | Versión | Licencia | Origen |
|---|---|---|---|
| PDF.js (Mozilla) | 6.3.289 | Apache-2.0 | https://github.com/mozilla/pdf.js |
| JSZip | 3.10.2 | MIT (doble licencia MIT o GPL-3.0; se usa bajo MIT) | https://github.com/Stuk/jszip |
| Tesseract.js y tesseract.js-core | 7.0.0 | Apache-2.0 | https://github.com/naptha/tesseract.js |
| Modelos de Tesseract `spa`, `por`, `eng` (tessdata_best, enteros) | 4.0.0 | Apache-2.0 (paquetes `@tesseract.js-data`, MIT) | https://github.com/tesseract-ocr/tessdata_best |

## Comunes a todas las versiones

| Componente | Licencia | Notas |
|---|---|---|
| Barlow y Barlow Condensed (Jeremy Tribby) | SIL Open Font License 1.1 | `h5pdf/static/fonts/OFL.txt` |
| Bibliotecas H5P de la plantilla (`h5pdf/templates/course-presentation.h5p`) | MIT (Joubel / H5P Group y otros autores), salvo H5P.MaterialDesignIcons (GPL-3.0) y H5P.TextUtilities (dominio público) | El paquete que genera H5PDF solo contiene `h5p.json` y `content/`: no incluye ninguna de estas bibliotecas. La versión web usa únicamente `h5p.json` y `content.json` de la plantilla. |

## Versión Python, app de macOS e imagen Docker

| Componente | Licencia |
|---|---|
| **PyMuPDF** (Artifex) | **AGPL-3.0** o licencia comercial |
| FastAPI, Pydantic, Pillow (MIT-CMU), PyObjC | MIT |
| Starlette, Uvicorn, Jinja2, pywebview | BSD-3-Clause |
| python-multipart, aiofiles, pytesseract | Apache-2.0 |
| Tesseract OCR y sus modelos (imagen Docker) | Apache-2.0 |
| PyInstaller (cargador de la app) | GPL-2.0 con excepción que permite distribuir la app con cualquier licencia |
| Python | PSF License |

**Consecuencia de PyMuPDF:** el código fuente de H5PDF es Apache 2.0, compatible con la AGPL.
Pero la app de macOS y la imagen Docker incluyen PyMuPDF, de modo que, como conjunto, se
distribuyen en los términos de la AGPL-3.0: quien las distribuya, o las ofrezca como servicio
en red, debe facilitar el código fuente correspondiente (por ejemplo, enlazando el
repositorio público de la versión exacta). La versión web no usa PyMuPDF y no tiene esta
obligación.
