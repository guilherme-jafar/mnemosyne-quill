import React from "react";
import styles from "./home.module.scss";

export const Home = (): React.JSX.Element => (
  <main className={styles.container}>
    <h1 className={styles.title}>Mnemosyne Quill</h1>
    <p className={styles.subtitle}>Your notes. Your storage. Open source.</p>
  </main>
);
