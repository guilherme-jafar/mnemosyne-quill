import React from "react";
import { Link } from "react-router-dom";
import styles from "./Breadcrumb.module.scss";

type BreadcrumbProps = {
  readonly notePath: string;
};

const stripExtension = (segment: string): string =>
  segment.replace(/\.md$/i, "");

export const Breadcrumb = ({ notePath }: BreadcrumbProps): React.JSX.Element => {
  const segments = notePath.split("/").filter(Boolean);

  return (
    <nav className={styles.breadcrumb} aria-label="Breadcrumb">
      <ol className={styles.list}>
        <li className={styles.item}>
          <Link to="/notes" className={styles.link}>Notes</Link>
        </li>
        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1;
          const href = `/notes/${segments.slice(0, index + 1).join("/")}`;
          return (
            <li key={href} className={styles.item}>
              <span className={styles.separator} aria-hidden="true">/</span>
              {isLast ? (
                <span className={styles.current}>{stripExtension(segment)}</span>
              ) : (
                <Link to={href} className={styles.link}>{segment}</Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
