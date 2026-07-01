interface BlogAuthorBioProps {
  author: string | null | undefined;
  createdAt: string;
}

export function BlogAuthorBio({ author, createdAt }: BlogAuthorBioProps) {
  if (!author) return null;

  const date = new Date(createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });

  return (
    <div className="mt-10 flex items-start gap-4 rounded-xl border border-navy-100 bg-white p-5">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-blue text-sm font-bold text-white">
        {author.charAt(0).toUpperCase()}
      </div>
      <div>
        <p className="text-sm font-bold text-navy-950">{author}</p>
        <p className="mt-0.5 text-xs text-slate-500">Published {date}</p>
      </div>
    </div>
  );
}
