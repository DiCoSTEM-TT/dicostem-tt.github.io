// Interfaz de la versión web estática de H5PDF (sin servidor).
import { ConversionError, convertPdf, loadBundledTemplate, loadTemplateFile } from "./h5pdf.js?v=0.2.0-1794939332";

const I18N = await (await fetch("i18n.json?v=0.2.0-1794939332")).json();

function pickLanguage() {
  const fromUrl = new URLSearchParams(location.search).get("lang");
  if (fromUrl && I18N.languages.includes(fromUrl)) return fromUrl;
  try {
    const saved = localStorage.getItem("h5pdf-lang");
    if (saved && I18N.languages.includes(saved)) return saved;
  } catch (err) {
    // sin almacenamiento local
  }
  for (const tag of navigator.languages || [navigator.language || ""]) {
    const code = tag.slice(0, 2).toLowerCase();
    if (I18N.languages.includes(code)) return code;
  }
  return "es";
}

const lang = pickLanguage();
const t = I18N.ui[lang];
const js = I18N.js[lang];
const errorText = (message) => (I18N.errors[lang] && I18N.errors[lang][message]) || message;

// Textos de la página.
document.documentElement.lang = I18N.html_lang[lang];
document.querySelectorAll("[data-t]").forEach((el) => {
  el.textContent = t[el.dataset.t] || "";
});
document.getElementById("project-link").href = t.project_url;
document.getElementById("help-link").href = `help/${lang}.html`;
document.getElementById("project-link").title = `DiCoSTEM-TT · ${t.project_name}`;
const funding = I18N.funding[lang];
document.getElementById("funding-logo").alt = funding.logo_alt;
document.getElementById("funding-logo").lang = funding.lang;
const fundingText = document.getElementById("funding-text");
fundingText.textContent = funding.text;
fundingText.lang = funding.lang;
const themeToggle = document.getElementById("theme-toggle");
themeToggle.setAttribute("aria-label", t.theme_toggle);
themeToggle.title = t.theme_toggle;

const switcher = document.getElementById("lang-switch");
switcher.setAttribute("aria-label", t.language_nav);
I18N.languages.forEach((code, i) => {
  if (i) switcher.append(" | ");
  const name = I18N.language_names[code];
  if (code === lang) {
    const strong = document.createElement("strong");
    strong.setAttribute("aria-current", "true");
    strong.textContent = name;
    switcher.append(strong);
  } else {
    const a = document.createElement("a");
    a.href = `?lang=${code}`;
    a.lang = I18N.html_lang[code];
    a.textContent = name;
    a.addEventListener("click", () => {
      try {
        localStorage.setItem("h5pdf-lang", code);
      } catch (err) {
        // sin almacenamiento local
      }
    });
    switcher.append(a);
  }
});

themeToggle.addEventListener("click", () => {
  const root = document.documentElement;
  const next = root.dataset.theme === "dark" ? "light" : "dark";
  root.dataset.theme = next;
  try {
    localStorage.setItem("h5pdf-theme", next);
  } catch (err) {
    // sin almacenamiento local
  }
});

// Conversión.
const form = document.getElementById("convert-form");
const button = document.getElementById("convert-button");
const buttonLabel = button.querySelector(".btn-label");
const progressFill = button.querySelector(".progress-fill");
const pdfInput = document.getElementById("pdf-input");
const templateInput = document.getElementById("template-input");
const titleInput = document.getElementById("title-input");
const info = document.getElementById("engine-info");
titleInput.value = t.default_title;

const reset = () => {
  button.classList.remove("btn-done");
  button.classList.add("btn-primary");
  buttonLabel.textContent = js.convert;
  progressFill.style.width = "0%";
  info.textContent = "";
};

pdfInput.addEventListener("change", () => {
  reset();
  const file = pdfInput.files && pdfInput.files[0];
  if (file) titleInput.value = file.name.replace(/\.[^.]+$/, "") || js.defaultTitle;
});

const suggestedName = () => {
  const name = (titleInput.value || js.defaultTitle).trim().replace(/[\\/:*?"<>|]/g, "_");
  return `${name || js.defaultTitle}.h5p`;
};

// Se pregunta dónde guardar antes de convertir: el navegador solo abre el selector
// durante la acción del usuario.
async function chooseDestination() {
  if (window.showSaveFilePicker) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: suggestedName(),
        types: [{ description: "H5P", accept: { "application/zip": [".h5p"] } }],
      });
      return { kind: "handle", handle };
    } catch (err) {
      if (err && err.name === "AbortError") return null;
    }
  }
  return { kind: "download" };
}

let bundledTemplate = null;

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const file = pdfInput.files && pdfInput.files[0];
  if (!file) {
    alert(js.selectPdf);
    return;
  }
  if (!file.name.toLowerCase().endsWith(".pdf")) {
    alert(js.notPdf);
    return;
  }
  reset();
  const destination = await chooseDestination();
  if (!destination) return;

  button.disabled = true;
  buttonLabel.textContent = js.converting;
  try {
    const templateFile = templateInput.files && templateInput.files[0];
    const template = templateFile
      ? await loadTemplateFile(templateFile)
      : (bundledTemplate ||= await loadBundledTemplate());
    const { blob } = await convertPdf(await file.arrayBuffer(), {
      title: titleInput.value,
      dpi: document.getElementById("dpi-input").value,
      transcript: document.getElementById("transcript-input").checked,
      template,
      lang,
      onProgress: (done, total) => {
        progressFill.style.width = `${Math.round((done / total) * 100)}%`;
        buttonLabel.textContent = `${js.converting} ${done}/${total}`;
      },
    });
    let message;
    if (destination.kind === "handle") {
      const writable = await destination.handle.createWritable();
      await writable.write(blob);
      await writable.close();
      message = js.savedAs + destination.handle.name;
    } else {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = suggestedName();
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      message = js.downloaded + suggestedName();
    }
    progressFill.style.width = "100%";
    button.classList.remove("btn-primary");
    button.classList.add("btn-done");
    buttonLabel.textContent = js.converted;
    info.textContent = message;
  } catch (err) {
    console.error(err);
    reset();
    alert(err instanceof ConversionError ? errorText(err.message) : js.serverError);
  } finally {
    button.disabled = false;
  }
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}

// Para las pruebas automáticas y la integración en otras páginas.
window.H5PDF = { convertPdf, loadBundledTemplate, loadTemplateFile };
