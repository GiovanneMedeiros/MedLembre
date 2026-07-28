const ERROR_PATTERNS: Array<{ match: RegExp; message: string }> = [
  { match: /invalid login credentials/i, message: "E-mail ou senha incorretos." },
  {
    match: /email not confirmed/i,
    message: "Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.",
  },
  {
    match: /user already registered|already been registered/i,
    message: "Este e-mail já está cadastrado. Tente entrar ou recuperar sua senha.",
  },
  {
    match: /password should be at least|password is too short/i,
    message: "A senha informada é muito curta.",
  },
  {
    match: /unable to validate email address|invalid email/i,
    message: "O e-mail informado não é válido.",
  },
  {
    match: /new password should be different/i,
    message: "A nova senha deve ser diferente da atual.",
  },
  {
    match: /for security purposes.*after (\d+) seconds?/i,
    message: "Muitas tentativas seguidas. Aguarde alguns segundos e tente novamente.",
  },
  {
    match: /email rate limit exceeded/i,
    message: "Muitos e-mails solicitados. Aguarde alguns minutos e tente novamente.",
  },
  {
    match: /token has expired|invalid or expired/i,
    message: "Este link expirou ou é inválido. Solicite um novo.",
  },
  {
    match: /session.*missing|auth session missing/i,
    message: "Sua sessão expirou. Faça login novamente.",
  },
  {
    match: /failed to fetch|network/i,
    message: "Não foi possível conectar. Verifique sua internet e tente novamente.",
  },
];

export function translateAuthError(error: unknown): string {
  const rawMessage = error instanceof Error ? error.message : String(error);

  for (const pattern of ERROR_PATTERNS) {
    if (pattern.match.test(rawMessage)) {
      return pattern.message;
    }
  }

  return "Ocorreu um erro inesperado. Tente novamente em instantes.";
}
