/** Manchas de cor se movendo devagar atrás do topo da página (mesmo estilo da landing). */
export function PageBackdrop() {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[34rem] overflow-hidden [mask-image:linear-gradient(to_bottom,black_55%,transparent)]"
      aria-hidden="true"
    >
      <div className="absolute -top-40 left-1/2 h-[26rem] w-[60rem] -translate-x-1/2 rounded-full bg-gradient-to-b from-brand-200/50 to-brand-100/0 blur-3xl" />
      <div className="absolute top-8 -left-24 h-72 w-72 animate-blob rounded-full bg-brand-200/40 blur-3xl" />
      <div
        className="absolute top-24 -right-20 h-80 w-80 animate-blob rounded-full bg-rose-200/40 blur-3xl"
        style={{ animationDelay: "-5s" }}
      />
      <div
        className="absolute top-72 left-1/3 h-64 w-64 animate-blob rounded-full bg-emerald-100/50 blur-3xl"
        style={{ animationDelay: "-9s" }}
      />
    </div>
  );
}
