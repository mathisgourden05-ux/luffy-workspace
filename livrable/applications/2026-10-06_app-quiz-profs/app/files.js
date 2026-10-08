// Lecture des cours déposés par le prof : PDF, Word, PowerPoint, OpenDocument, texte, lien Google Docs/Slides.
// Les fichiers sont lus dans le navigateur : ils ne sont envoyés nulle part, seul le texte extrait part vers l'IA.
// Les lecteurs (pdf.js, mammoth, JSZip) ne sont téléchargés qu'au premier fichier déposé.
import { ONLINE, serverReadLink } from "./data.js";

const CDN = "https://cdnjs.cloudflare.com/ajax/libs";
export const MAX_SOURCE = 60000; // même limite que la fonction serveur qz-generate (~30 pages de cours)
export const ACCEPT = ".pdf,.docx,.pptx,.odt,.odp,.txt,.md,.rtf,.html,.htm";

const loaded = {};
function loadScript(src) {
  return (loaded[src] ||= new Promise((ok, ko) => {
    const s = document.createElement("script");
    s.src = src;
    s.onload = ok;
    s.onerror = () => { delete loaded[src]; ko(new Error("Impossible de charger le lecteur de fichiers. Vérifiez la connexion.")); };
    document.head.append(s);
  }));
}

async function readPdf(file) {
  const pdfjs = await import(`${CDN}/pdf.js/6.4.299/pdf.min.mjs`);
  pdfjs.GlobalWorkerOptions.workerSrc = `${CDN}/pdf.js/6.4.299/pdf.worker.min.mjs`;
  const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  const pages = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const { items } = await (await doc.getPage(i)).getTextContent();
    pages.push(items.map((it) => it.str + (it.hasEOL ? "\n" : " ")).join(""));
  }
  const text = pages.join("\n\n");
  if (text.replace(/\s/g, "").length < 20 * doc.numPages) {
    throw new Error(`« ${file.name} » ressemble à un document scanné (des images, pas du texte). Exportez-le depuis Word ou Google Docs, ou collez le texte à la main.`);
  }
  return text;
}

async function readDocx(file) {
  await loadScript(`${CDN}/mammoth/1.13.0/mammoth.browser.min.js`);
  return (await window.mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() })).value;
}

// PowerPoint et OpenDocument sont des archives zip de fichiers XML : on lit le texte paragraphe par paragraphe.
async function readZipXml(file, ext) {
  await loadScript(`${CDN}/jszip/3.10.2/jszip.min.js`);
  const zip = await window.JSZip.loadAsync(await file.arrayBuffer());
  const num = (n) => +n.match(/(\d+)\.xml$/)[1];
  const names = ext === "pptx"
    ? Object.keys(zip.files).filter((n) => /^ppt\/slides\/slide\d+\.xml$/.test(n)).sort((a, b) => num(a) - num(b))
    : ["content.xml"];
  const parts = [];
  for (const name of names) {
    const xml = await zip.file(name)?.async("text");
    if (!xml) continue;
    const dom = new DOMParser().parseFromString(xml, "application/xml");
    const paras = [...dom.getElementsByTagName("*")].filter((e) => e.localName === "p" || (ext !== "pptx" && e.localName === "h"));
    parts.push(paras.map((p) => p.textContent.trim()).filter(Boolean).join("\n"));
  }
  return parts.join("\n\n");
}

async function readHtml(file) {
  return new DOMParser().parseFromString(await file.text(), "text/html").body.innerText;
}

// Renvoie le texte du fichier, ou lève une erreur lisible par le prof.
export async function readFile(file) {
  const ext = (file.name.split(".").pop() || "").toLowerCase();
  if (file.size > 30 * 1024 * 1024) throw new Error(`« ${file.name} » dépasse 30 Mo.`);
  let text;
  if (ext === "pdf") text = await readPdf(file);
  else if (ext === "docx") text = await readDocx(file);
  else if (["pptx", "odt", "odp"].includes(ext)) text = await readZipXml(file, ext);
  else if (["html", "htm"].includes(ext)) text = await readHtml(file);
  else if (["txt", "md", "rtf", "csv"].includes(ext)) text = await file.text();
  else if (["doc", "ppt"].includes(ext)) throw new Error(`Ancien format .${ext} : enregistrez « ${file.name} » en .${ext}x ou en PDF, puis redéposez-le.`);
  else throw new Error(`Format non pris en charge pour « ${file.name} ». Formats acceptés : PDF, Word, PowerPoint, OpenDocument, texte.`);
  text = text.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
  if (!text) throw new Error(`Aucun texte trouvé dans « ${file.name} ».`);
  return text;
}

// Lien Google Docs ou Google Slides : lu par le serveur (le navigateur n'a pas le droit de le faire lui-même).
export const isGoogleLink = (s) => /docs\.google\.com\/(document|presentation)\/d\/[\w-]+/.test(s);

export async function readLink(url) {
  if (!ONLINE) throw new Error("La lecture des liens Google n'est possible qu'en ligne. Téléchargez le document (Fichier → Télécharger → PDF) et déposez-le ici.");
  return (await serverReadLink(url)).text;
}
