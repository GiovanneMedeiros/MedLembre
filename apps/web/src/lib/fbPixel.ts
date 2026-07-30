type Fbq = (...args: unknown[]) => void;

function getFbq(): Fbq | null {
  const fbq = (window as unknown as { fbq?: Fbq }).fbq;
  return typeof fbq === "function" ? fbq : null;
}

export function trackPageView(): void {
  getFbq()?.("track", "PageView");
}

export function trackEvent(name: string, params?: Record<string, unknown>): void {
  getFbq()?.("track", name, params);
}
