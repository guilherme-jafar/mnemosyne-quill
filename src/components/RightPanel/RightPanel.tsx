import React from "react";
import { TableOfContents } from "../TableOfContents/TableOfContents";
import styles from "./RightPanel.module.scss";

export const RightPanel = (): React.JSX.Element => (
  <aside className={styles.panel} aria-label="Note details">
    <TableOfContents />
    <div className={styles.graphSection}>
      <p className={styles.graphLabel}>Graph</p>
      <div className={styles.graphPlaceholder} />
    </div>
  </aside>
);
