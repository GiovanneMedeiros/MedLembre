const VISITOR_ID_KEY = "medlembre:visitor-id";

// Identificador anônimo por navegador — só pra distinguir visitantes
// únicos no /adm, sem nenhuma relação com a conta logada (se houver).
export function getVisitorId(): string {
  let id = localStorage.getItem(VISITOR_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(VISITOR_ID_KEY, id);
  }
  return id;
}
