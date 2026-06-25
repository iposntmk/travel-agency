interface Props {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  center?: boolean;
}

export function IzitourSectionHeading({ eyebrow, title, subtitle, center = false }: Props) {
  return (
    <div className={center ? "mx-auto mb-9 max-w-3xl text-center" : "mb-9 max-w-3xl"}>
      {eyebrow ? (
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--izitour-primary)]">{eyebrow}</p>
      ) : null}
      <h2 className="mt-2 text-3xl font-bold leading-tight text-[var(--izitour-dark)] md:text-[40px]">{title}</h2>
      {subtitle ? <p className="mt-3 text-base leading-7 text-[var(--izitour-body)]">{subtitle}</p> : null}
    </div>
  );
}
