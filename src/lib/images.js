import { fileToDataUrl } from "./utils.js";

// localStorage on Chrome is about 5 million characters for this origin, and a
// data URL is ~4/3 the file size. Two characters with two untouched phone
// photos (3–6MB each) cannot be saved. Cap each stored photo so several of
// them, plus wardrobe shots, fit with room to spare.
const MAX_DATA_URL_CHARS = 220_000;
const EDGES = [1600, 1280, 1024, 800, 640];
const QUALITIES = [0.8, 0.68, 0.56, 0.45];

/**
 * Downscale and JPEG-compress a photo for localStorage.
 * If the browser cannot decode it (HEIC on Chrome, for example), the original
 * data URL is returned unchanged.
 */
export async function preparePhoto(file) {
  let decoded;
  try {
    decoded = await decodeForCanvas(file);
  } catch {
    return fileToDataUrl(file);
  }

  try {
    const { source, width, height } = decoded;
    if (!width || !height) return fileToDataUrl(file);

    let best = null;
    for (const edge of EDGES) {
      const canvas = render(source, width, height, edge);
      for (const quality of QUALITIES) {
        const url = await canvasToJpeg(canvas, quality);
        if (!url) continue;
        if (!best || url.length < best.length) best = url;
        if (url.length <= MAX_DATA_URL_CHARS) return url;
        // Hopeless at this size — a lower quality pass will not close a 4x gap.
        if (url.length > MAX_DATA_URL_CHARS * 4) break;
      }
    }
    return best || fileToDataUrl(file);
  } catch {
    return fileToDataUrl(file);
  } finally {
    decoded.cleanup?.();
  }
}

async function decodeForCanvas(file) {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
      if (bitmap.width > 0 && bitmap.height > 0) {
        return {
          source: bitmap,
          width: bitmap.width,
          height: bitmap.height,
          cleanup: () => bitmap.close?.(),
        };
      }
      bitmap.close?.();
    } catch {
      // Fall through to the image element, then to the original bytes.
    }
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("undecodable"));
      el.src = objectUrl;
    });
    if (!img.naturalWidth || !img.naturalHeight) throw new Error("empty");
    return {
      source: img,
      width: img.naturalWidth,
      height: img.naturalHeight,
      cleanup: () => URL.revokeObjectURL(objectUrl),
    };
  } catch (err) {
    URL.revokeObjectURL(objectUrl);
    throw err;
  }
}

function render(source, width, height, maxEdge) {
  const scale = Math.min(1, maxEdge / Math.max(width, height));
  const w = Math.max(1, Math.round(width * scale));
  const h = Math.max(1, Math.round(height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { alpha: false });
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, 0, 0, w, h);
  return canvas;
}

function canvasToJpeg(canvas, quality) {
  return new Promise((resolve) => {
    const finish = (url) => resolve(typeof url === "string" && url.startsWith("data:image/jpeg") ? url : null);
    if (!canvas.toBlob) {
      try {
        finish(canvas.toDataURL("image/jpeg", quality));
      } catch {
        resolve(null);
      }
      return;
    }
    canvas.toBlob(async (blob) => {
      if (!blob) {
        try {
          finish(canvas.toDataURL("image/jpeg", quality));
        } catch {
          resolve(null);
        }
        return;
      }
      try {
        finish(await fileToDataUrl(blob));
      } catch {
        resolve(null);
      }
    }, "image/jpeg", quality);
  });
}
