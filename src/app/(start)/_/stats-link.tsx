import Link from "next/link";

export default function StatsLink() {
  return (
    <Link
      href="/stats"
      className="grid h-15 w-full place-items-center rounded border-b-4 border-amber-700 bg-amber-900 px-4 py-2 font-bold text-white uppercase transition-colors hover:border-amber-500 hover:bg-amber-700"
    >
      Ölstatistik
    </Link>
  );
}
