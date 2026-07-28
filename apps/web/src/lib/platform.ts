export function isIos(): boolean {
  const ua = window.navigator.userAgent;
  const isAppleDevice = /iPad|iPhone|iPod/.test(ua);
  const isIpadOnMacUa = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  return isAppleDevice || isIpadOnMacUa;
}

export function isStandalone(): boolean {
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true;
}
