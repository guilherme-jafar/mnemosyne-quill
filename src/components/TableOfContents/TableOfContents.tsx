import React from "react";
import { useHeadings } from "../../context/headings-context";
import styles from "./TableOfContents.module.scss";

export const TableOfContents = (): React.JSX.Element | null => {
  const { headings } = useHeadings();

  if (headings.length === 0) return null;

  return (
    <div className={styles.toc}>
      <p className={styles.label}>On this page</p>
      <ol className={styles.list}>
        {headings.map((h) => (
          <li key={h.id} className={styles.item} data-level={h.level}>
            <a href={`#${h.id}`} className={styles.link}>
              {h.text}
            </a>
          </li>
        ))}
      </ol>
    </div>
  );
};
