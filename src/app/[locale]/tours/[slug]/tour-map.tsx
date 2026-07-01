interface Props {
  query: string;
  label: string;
}

export function TourMap({ query, label }: Props) {
  const src = `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;

  return (
    <section aria-labelledby="tour-map-heading">
      <h2 id="tour-map-heading" className="font-display text-2xl font-bold tracking-tight text-navy-950">
        Where you&apos;ll be
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{label}</p>
      <div className="mt-4 overflow-hidden rounded-2xl border border-navy-100">
        <iframe
          title={`Map of ${label}`}
          src={src}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="h-72 w-full md:h-80"
        />
      </div>
    </section>
  );
}
