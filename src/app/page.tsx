import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <Image
        src="/logo.svg"
        alt="Beer or No Beer logo"
        width={400}
        height={400}
        priority
      />
    </div>
  );
}
