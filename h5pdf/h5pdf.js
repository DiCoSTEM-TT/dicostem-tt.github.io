// Motor de H5PDF para el navegador: PDF -> paquete H5P de Presentación de curso.
// Traduce el conversor Python (h5pdf/converter/*.py), que es la referencia: las pruebas de
// paridad (tests/test_web_parity.py) comprueban que ambos producen el mismo paquete.
// Todo ocurre en el equipo de quien lo usa: el PDF no se envía a ningún servidor.

// Bibliotecas servidas junto a la página (scripts/fetch_web_vendor.py): sin conexión a terceros.
const vendor = (path) => new URL(`vendor/${path}`, import.meta.url).href;
const PDFJS = vendor("pdfjs/pdf.min.mjs");
const PDFJS_WORKER = vendor("pdfjs/pdf.worker.min.mjs");
const PDFJS_OPTIONS = {
  cMapUrl: vendor("pdfjs/cmaps/"),
  cMapPacked: true,
  standardFontDataUrl: vendor("pdfjs/standard_fonts/"),
  wasmUrl: vendor("pdfjs/wasm/"),
  isEvalSupported: false,
};
const TESSERACT = vendor("tesseract/tesseract.esm.min.js");
const TESSERACT_OPTIONS = {
  workerPath: vendor("tesseract/worker.min.js"),
  corePath: vendor("tesseract/core/"),
  langPath: vendor("tesseract/lang/"),
};

// Hueco de la diapositiva en Course Presentation 1.26 y 1.27: lienzo 16:9 con la diapositiva
// al 90 % del alto (el resto son las barras de progreso y navegación).
export const SLIDE_RATIO = 16 / (9 * 0.9);
const RATIO_TOLERANCE = 0.005;
const TRANSCRIPT_BUTTON_BOX = { x: 95.625, y: 91.36, width: 3.75, height: 7.41 };
const DEFAULT_LIBRARIES = { "H5P.AdvancedText": [1, 1], "H5P.Image": [1, 1] };
const SKIPPED_TEMPLATE_FILES = new Set(["content.json", "config.json"]);
const OCR_ORDER = { es: ["spa", "por", "eng"], pt: ["por", "spa", "eng"], en: ["eng", "spa", "por"] };

// Sin entradas de carpeta en el ZIP, igual que el paquete que genera Python.
const NO_FOLDERS = { createFolders: false };

export class ConversionError extends Error {}

// --- Utilidades equivalentes a Python ------------------------------------------------

// round() de Python: redondeo al par más cercano en los empates.
function pyRound(value, digits = 0) {
  const factor = 10 ** digits;
  const x = value * factor;
  const floor = Math.floor(x);
  const diff = x - floor;
  let result;
  if (Math.abs(diff - 0.5) < 1e-9) {
    result = floor % 2 === 0 ? floor : floor + 1;
  } else {
    result = Math.round(x);
  }
  return result / factor;
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

function isDigit(ch) {
  return ch !== undefined && /\p{Nd}/u.test(ch);
}

// _normalize_lines de pdf_parser.py: une las líneas de un mismo párrafo.
export function normalizeLines(text) {
  const out = [];
  let current = "";
  const flush = () => {
    if (current.trim()) out.push(current.trim());
    current = "";
  };
  const isListItem = (s) => {
    s = s.trim();
    if (s.startsWith("-") || s.startsWith("•")) return true;
    if (s.length >= 2 && isDigit(s[0]) && ".)".includes(s[1])) return true;
    if (s.length >= 3 && isDigit(s[0]) && isDigit(s[1]) && ".)".includes(s[2])) return true;
    return false;
  };
  for (const raw of text.split(/\r\n|\r|\n/)) {
    const stripped = raw.trim();
    if (!stripped) {
      flush();
      continue;
    }
    if (isListItem(stripped)) {
      flush();
      out.push(stripped);
      current = "";
      continue;
    }
    if (!current) {
      current = stripped;
      continue;
    }
    current = current.endsWith("-") ? current.slice(0, -1) + stripped : `${current} ${stripped}`;
  }
  flush();
  return out.join("\n");
}

// _fit_to_slide: caja (x, y, w, h en %) de la página centrada y sin deformar en el hueco.
export function fitToSlide(width, height) {
  if (!width || !height) return [0, 0, 100, 100];
  const ratio = width / height;
  if (Math.abs(ratio / SLIDE_RATIO - 1) <= RATIO_TOLERANCE) return [0, 0, 100, 100];
  const w = Math.min(1, ratio / SLIDE_RATIO) * 100;
  const h = Math.min(1, SLIDE_RATIO / ratio) * 100;
  return [pyRound((100 - w) / 2, 4), pyRound((100 - h) / 2, 4), pyRound(w, 4), pyRound(h, 4)];
}

// _extend_to_slide: amplía la imagen prolongando la fila o columna del borde.
function extendToSlide(source, box) {
  const [, , boxW, boxH] = box;
  const { width, height } = source;
  if (boxW >= 100 && boxH >= 100) return source;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  if (boxW < 100) {
    const total = pyRound((width * 100) / boxW);
    const left = Math.floor((total - width) / 2);
    const right = total - width - left;
    canvas.width = total;
    canvas.height = height;
    ctx.drawImage(source, 0, 0, 1, height, 0, 0, Math.max(left, 1), height);
    ctx.drawImage(source, width - 1, 0, 1, height, left + width, 0, Math.max(right, 1), height);
    ctx.drawImage(source, left, 0);
  } else {
    const total = pyRound((height * 100) / boxH);
    const top = Math.floor((total - height) / 2);
    const bottom = total - height - top;
    canvas.width = width;
    canvas.height = total;
    ctx.drawImage(source, 0, 0, width, 1, 0, 0, width, Math.max(top, 1));
    ctx.drawImage(source, 0, height - 1, width, 1, 0, top + height, width, Math.max(bottom, 1));
    ctx.drawImage(source, 0, top);
  }
  return canvas;
}

function canvasToPng(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("toBlob"))), "image/png");
  });
}

// --- Plantilla ---------------------------------------------------------------------

function libraryVersions(h5pJson, semanticsText) {
  const versions = { ...DEFAULT_LIBRARIES };
  if (semanticsText) {
    for (const [, name, major, minor] of semanticsText.matchAll(/"(H5P\.[A-Za-z]+) (\d+)\.(\d+)"/g)) {
      if (name in versions) versions[name] = [Number(major), Number(minor)];
    }
  }
  return versions;
}

// Plantilla incluida: template.json lo genera scripts/build_web.py a partir de
// h5pdf/templates/course-presentation.h5p.
export async function loadBundledTemplate(url = "template.json") {
  const response = await fetch(url);
  const data = await response.json();
  return { h5pJson: data.h5p_json, content: data.content, libraries: data.libraries, files: [] };
}

// Plantilla subida por el usuario (.h5p exportado de Moodle). Equivale a template.py.
export async function loadTemplateFile(file) {
  const JSZip = window.JSZip;
  let zip;
  try {
    zip = await JSZip.loadAsync(file);
  } catch (err) {
    throw new ConversionError("Plantilla H5P no válida: no es un archivo .h5p.");
  }
  const h5pEntry = zip.file("h5p.json");
  const contentEntry = zip.file("content/content.json");
  if (!h5pEntry || !contentEntry) {
    throw new ConversionError("Plantilla H5P no válida: faltan h5p.json o content/content.json.");
  }
  let h5pJson;
  let content;
  try {
    h5pJson = JSON.parse(await h5pEntry.async("string"));
    content = JSON.parse(await contentEntry.async("string"));
  } catch (err) {
    throw new ConversionError("Plantilla H5P no válida: faltan h5p.json o content/content.json.");
  }
  const main = h5pJson.mainLibrary || "H5P.CoursePresentation";
  const dep = (h5pJson.preloadedDependencies || []).find((d) => d.machineName === main);
  let semantics = null;
  if (dep) {
    const entry = zip.file(`${main}-${Number(dep.majorVersion)}.${Number(dep.minorVersion)}/semantics.json`);
    if (entry) semantics = await entry.async("string");
  }
  const files = [];
  for (const [path, entry] of Object.entries(zip.files)) {
    if (entry.dir || !path.startsWith("content/")) continue;
    if (SKIPPED_TEMPLATE_FILES.has(path.slice("content/".length))) continue;
    files.push({ path, data: await entry.async("uint8array") });
  }
  return { h5pJson, content, libraries: libraryVersions(h5pJson, semantics), files };
}

// --- Contenido H5P (h5p_builder.py) --------------------------------------------------

const libraryName = (template, name) => `${name} ${template.libraries[name][0]}.${template.libraries[name][1]}`;

function imageElement(image, library) {
  return {
    x: image.x,
    y: image.y,
    width: image.w,
    height: image.h,
    action: {
      library,
      params: {
        decorative: false,
        contentName: "Image",
        expandImage: "Expand Image",
        minimizeImage: "Minimize Image",
        file: {
          path: image.path,
          mime: image.mime,
          width: image.widthPx,
          height: image.heightPx,
          copyright: { license: "U" },
        },
        alt: image.alt || "",
        title: image.title || "",
      },
      subContentId: crypto.randomUUID(),
      metadata: { contentType: "Image", license: "U", title: "Untitled Image", authors: [], changes: [] },
    },
    alwaysDisplayComments: false,
    displayAsButton: false,
    invisible: false,
    backgroundOpacity: 0,
    buttonSize: "big",
    solution: "",
    goToSlideType: "specified",
    goToSlide: 0,
  };
}

function transcriptButton(text, library) {
  const safe = escapeHtml(text || "").replace(/\n/g, "<br>");
  return {
    ...TRANSCRIPT_BUTTON_BOX,
    action: {
      library,
      params: { text: `<p style="white-space:pre-line;">${safe}</p>` },
      subContentId: crypto.randomUUID(),
      metadata: { contentType: "Text", license: "U", title: "Transcript", authors: [], changes: [] },
    },
    alwaysDisplayComments: false,
    displayAsButton: true,
    invisible: false,
    backgroundOpacity: 0,
    buttonSize: "small",
    solution: "",
    goToSlideType: "specified",
    goToSlide: 0,
  };
}

function buildContent(slides, template) {
  const content = structuredClone(template.content);
  const presentation = { ...(content.presentation || {}) };
  const slideTemplate = presentation.slides && presentation.slides.length ? presentation.slides[0] : null;
  const image = libraryName(template, "H5P.Image");
  const text = libraryName(template, "H5P.AdvancedText");
  presentation.slides = slides.map((slide) => {
    const elements = [imageElement(slide.background, image)];
    if (slide.transcript) elements.push(transcriptButton(slide.transcript, text));
    const entry = slideTemplate
      ? { ...structuredClone(slideTemplate), elements }
      : { elements, keywords: [], slideBackgroundSelector: {} };
    if (!("keywords" in entry)) entry.keywords = [];
    if (!("slideBackgroundSelector" in entry)) entry.slideBackgroundSelector = {};
    return entry;
  });
  content.presentation = presentation;
  return content;
}

function buildH5pJson(template, title) {
  const h5pJson = { ...template.h5pJson, title };
  const preloaded = (template.h5pJson.preloadedDependencies || []).map((dep) => ({
    ...dep,
    majorVersion: Number(dep.majorVersion),
    minorVersion: Number(dep.minorVersion),
  }));
  for (const name of ["H5P.AdvancedText", "H5P.Image"]) {
    if (!preloaded.some((dep) => dep.machineName === name)) {
      const [major, minor] = template.libraries[name];
      preloaded.push({ machineName: name, majorVersion: major, minorVersion: minor });
    }
  }
  h5pJson.preloadedDependencies = preloaded;
  return h5pJson;
}

// --- PDF ---------------------------------------------------------------------------

let pdfjsPromise = null;
async function pdfjs() {
  if (!pdfjsPromise) {
    pdfjsPromise = import(PDFJS).then((lib) => {
      lib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
      return lib;
    });
  }
  return pdfjsPromise;
}

let ocrWorker = null;
async function recognize(canvas, lang) {
  if (!ocrWorker) {
    const Tesseract = await import(TESSERACT);
    const create = Tesseract.createWorker || Tesseract.default.createWorker;
    // OEM 1 = solo LSTM: usa los modelos best_int y el núcleo "-lstm".
    ocrWorker = await create((OCR_ORDER[lang] || OCR_ORDER.es).join("+"), 1, TESSERACT_OPTIONS);
  }
  const { data } = await ocrWorker.recognize(canvas);
  return data.text || "";
}

async function pageText(page) {
  // PDF.js no siempre marca el final de línea entre bloques: también se corta cuando el
  // fragmento cambia de altura, como hace PyMuPDF al separar líneas.
  const content = await page.getTextContent();
  let text = "";
  let lastY = null;
  for (const item of content.items) {
    if (!("str" in item)) continue;
    const y = item.transform[5];
    const size = Math.hypot(item.transform[2], item.transform[3]) || item.height || 1;
    if (lastY !== null && !text.endsWith("\n") && Math.abs(y - lastY) > size * 0.5) text += "\n";
    text += item.str;
    if (item.str) lastY = y;
    if (item.hasEOL) text += "\n";
  }
  return normalizeLines(text);
}

/**
 * Convierte un PDF en un paquete .h5p.
 * @param {ArrayBuffer} pdfData
 * @param {object} options title, dpi, transcript, template, lang, ocr, onProgress(done, total)
 * @returns {Promise<{blob: Blob, meta: object}>}
 */
export async function convertPdf(pdfData, options = {}) {
  const {
    title = "Exportación H5PDF",
    dpi = 150,
    transcript = true,
    template,
    lang = "es",
    ocr = true,
    onProgress = () => {},
  } = options;
  const head = new TextDecoder("latin1").decode(new Uint8Array(pdfData.slice(0, 1024)));
  if (!head.includes("%PDF-")) throw new ConversionError("El archivo no es un PDF válido.");
  if (!template) throw new ConversionError("Falta la plantilla H5P. Exporta desde Moodle una Presentación de curso (Course Presentation) vacía y súbela, o define H5P_TEMPLATE_PATH.");

  const lib = await pdfjs();
  let doc;
  const loadingTask = lib.getDocument({ data: new Uint8Array(pdfData), ...PDFJS_OPTIONS });
  try {
    doc = await loadingTask.promise;
  } catch (err) {
    if (err && err.name === "PasswordException") throw new ConversionError("El PDF está protegido con contraseña.");
    throw new ConversionError("El PDF está dañado o no se puede abrir.");
  }

  const safeDpi = Math.max(72, Math.min(Math.round(Number(dpi) || 150), 600));
  const safeTitle = String(title).trim().slice(0, 255) || "Exportación H5PDF";
  const zip = new window.JSZip();
  const slides = [];
  const ocrPages = [];
  const scale = safeDpi / 72;

  for (let index = 1; index <= doc.numPages; index += 1) {
    const page = await doc.getPage(index);
    const pageViewport = page.getViewport({ scale: 1 });
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    // Mismo tamaño que el pixmap de PyMuPDF.
    canvas.width = Math.ceil(viewport.width - 1e-3);
    canvas.height = Math.ceil(viewport.height - 1e-3);
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, canvas, viewport }).promise;

    let text = await pageText(page);
    if (!text && ocr) {
      text = normalizeLines(await recognize(canvas, lang));
      if (text) ocrPages.push(index);
    }

    const box = fitToSlide(pageViewport.width, pageViewport.height);
    const background = extendToSlide(canvas, box);
    const path = `backgrounds/page-${index}.png`;
    zip.file(`content/${path}`, await canvasToPng(background), NO_FOLDERS);
    slides.push({
      background: {
        x: 0, y: 0, w: 100, h: 100,
        path, mime: "image/png",
        widthPx: background.width, heightPx: background.height,
        alt: text, title: text,
      },
      transcript: transcript ? text : "",
    });
    page.cleanup();
    canvas.width = 0;
    onProgress(index, doc.numPages);
  }
  await loadingTask.destroy();

  for (const file of template.files || []) zip.file(file.path, file.data, NO_FOLDERS);
  zip.file("h5p.json", JSON.stringify(buildH5pJson(template, safeTitle), null, 2), NO_FOLDERS);
  zip.file("content/content.json", JSON.stringify(buildContent(slides, template), null, 2), NO_FOLDERS);
  const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });
  return { blob, meta: { pages: slides.length, ocrPages, ocr: ocrPages.length ? "tesseract.js" : null } };
}
