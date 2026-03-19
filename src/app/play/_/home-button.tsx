import Link from "next/link";

export default function HomeButton() {
  return (
    <Link href="/" className="w-full grid">
      <span className="inline-flex min-h-15 w-full items-center justify-center rounded-2xl border border-amber-800/70 bg-black/14 px-4 py-3 text-center text-base font-bold uppercase tracking-[0.06em] text-amber-100/92 transition-colors hover:border-amber-700/80 hover:bg-black/24 hover:text-amber-50">
        Hem
      </span>
    </Link>
  );
}
