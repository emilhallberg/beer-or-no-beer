import Image from "next/image";
import Link from "next/link";

export default function Brand({
  compact = false,
  linked = false,
}: {
  compact?: boolean;
  linked?: boolean;
}) {
  const content = compact ? (
    <span className="brand-compact">
      <span aria-hidden="true" className="brand-dot" />
      Beer or No Beer<span className="brand-question">?</span>
    </span>
  ) : (
    <div className="brand-lockup" aria-label="Beer or No Beer?">
      <Image
        src="/logo-pub.png"
        alt="Beer or No Beer? — The Ultimate Beverage Challenge!"
        width={1280}
        height={1280}
        className="brand-original"
        priority
        sizes="(max-width: 639px) 280px, 380px"
      />
    </div>
  );
  return linked ? (
    <Link
      href="/"
      className="brand-link"
      aria-label="Beer or No Beer? — till startsidan"
    >
      {content}
    </Link>
  ) : (
    content
  );
}
