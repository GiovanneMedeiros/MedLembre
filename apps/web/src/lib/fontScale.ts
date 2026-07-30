const STORAGE_KEY = "medlembre:fonte-grande";
const SCALE_CLASS = "text-scale-lg";

export function isLargeTextEnabled(): boolean {
  return localStorage.getItem(STORAGE_KEY) === "1";
}

export function setLargeText(enabled: boolean): void {
  localStorage.setItem(STORAGE_KEY, enabled ? "1" : "0");
  document.documentElement.classList.toggle(SCALE_CLASS, enabled);
}

// Chamado uma vez na inicialização do app, antes do primeiro render, para
// não piscar o tamanho normal antes de aplicar a preferência salva.
export function applyStoredFontScale(): void {
  document.documentElement.classList.toggle(SCALE_CLASS, isLargeTextEnabled());
}
