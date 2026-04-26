import React, { useState } from "react";
import { localAdapter } from "../adapters/local-adapter";
import styles from "./settings.module.scss";

const isFileSystemAccessSupported = (): boolean =>
  typeof window !== "undefined" && "showDirectoryPicker" in window;

type ConnectStatus = "idle" | "connected" | "error";

export const Settings = (): React.JSX.Element => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [status, setStatus] = useState<ConnectStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleConnect = async (): Promise<void> => {
    setIsConnecting(true);
    setErrorMessage(null);
    try {
      await localAdapter.connect();
      setStatus("connected");
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        setStatus("idle");
      } else {
        setErrorMessage(
          err instanceof Error ? err.message : "Failed to connect."
        );
        setStatus("error");
      }
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Settings</h1>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Storage</h2>

        {!isFileSystemAccessSupported() ? (
          <p className={styles.compatibility}>
            Your browser does not support the File System Access API. Please use
            Chrome, Edge, or Opera to connect a local folder.
          </p>
        ) : (
          <div className={styles.adapterCard}>
            <p className={styles.description}>
              Connect a local folder to read and write notes directly from your
              filesystem. Your notes stay on your device — no cloud required.
            </p>
            <button
              className={styles.connectButton}
              onClick={handleConnect}
              disabled={isConnecting}
            >
              {isConnecting ? "Connecting…" : "Connect local folder"}
            </button>
            {status === "connected" && (
              <p className={styles.successMessage}>
                Folder connected. Go to{" "}
                <a href="/notes" className={styles.link}>
                  Notes
                </a>{" "}
                to start reading.
              </p>
            )}
            {status === "error" && errorMessage && (
              <p className={styles.errorMessage}>{errorMessage}</p>
            )}
          </div>
        )}
      </section>
    </main>
  );
};
