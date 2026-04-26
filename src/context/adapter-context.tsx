import { createContext, useContext } from "react";
import type { StorageAdapter } from "../adapters/storage-adapter";
import { stubAdapter } from "../adapters/stub-adapter";

const AdapterContext = createContext<StorageAdapter>(stubAdapter);

export const AdapterProvider = AdapterContext.Provider;

export const useAdapter = (): StorageAdapter => useContext(AdapterContext);
