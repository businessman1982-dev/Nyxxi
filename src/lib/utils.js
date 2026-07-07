export const uid = () => Math.random().toString(36).slice(2, 10);

const SWATCHES = ["#7F77DD", "#1D9E75", "#D85A30", "#D4537E", "#378ADD", "#BA7517"];

export function colorFor(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = seed.charCodeAt(i) + ((h << 5) - h);
  return SWATCHES[Math.abs(h) % SWATCHES.length];
}

export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}
