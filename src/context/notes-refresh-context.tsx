import React, { createContext, useCallback, useContext, useState } from "react";

type NotesRefreshContextValue = {
  readonly refreshKey: number;
  readonly refreshNotes: () => void;
};

const NotesRefreshContext = createContext<NotesRefreshContextValue | null>(null);

type NotesRefreshProviderProps = {
  readonly children: React.ReactNode;
};

export const NotesRefreshProvider = ({
  children,
}: NotesRefreshProviderProps): React.JSX.Element => {
  const [refreshKey, setRefreshKey] = useState(0);
  const refreshNotes = useCallback(() => setRefreshKey((k) => k + 1), []);
  return (
    <NotesRefreshContext.Provider value={{ refreshKey, refreshNotes }}>
      {children}
    </NotesRefreshContext.Provider>
  );
};

export const useNotesRefresh = (): NotesRefreshContextValue => {
  const ctx = useContext(NotesRefreshContext);
  if (!ctx) throw new Error("useNotesRefresh must be used inside NotesRefreshProvider");
  return ctx;
};
