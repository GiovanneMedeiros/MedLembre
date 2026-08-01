import { api } from "./api";
import { getVisitorId } from "./visitorId";

// "Fire and forget": pageview não pode nunca travar nem quebrar a
// navegação do usuário, então falhas são silenciosamente ignoradas.
export function trackPageview(path: string): void {
  api.post("/analytics/pageview", { path, visitorId: getVisitorId() }).catch(() => {});
}
