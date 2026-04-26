import React, { createContext, useContext, useState } from "react";

type Heading = {
  readonly level: number;
  readonly text: string;
  readonly id: string;
};

type HeadingsContextValue = {
  readonly headings: Heading[];
  readonly setHeadings: (headings: Heading[]) => void;
};

const HeadingsContext = createContext<HeadingsContextValue | null>(null);

type HeadingsProviderProps = {
  readonly children: React.ReactNode;
};

export const HeadingsProvider = ({ children }: HeadingsProviderProps): React.JSX.Element => {
  const [headings, setHeadings] = useState<Heading[]>([]);
  return (
    <HeadingsContext.Provider value={{ headings, setHeadings }}>
      {children}
    </HeadingsContext.Provider>
  );
};

export const useHeadings = (): HeadingsContextValue => {
  const ctx = useContext(HeadingsContext);
  if (!ctx) throw new Error("useHeadings must be used inside HeadingsProvider");
  return ctx;
};

export type { Heading };
