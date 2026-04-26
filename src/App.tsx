import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AdapterProvider } from "./context/adapter-context";
import { localAdapter } from "./adapters/local-adapter";
import { Home } from "./routes/home";
import { Notes } from "./routes/notes";
import { NoteEditor } from "./routes/note-editor";
import { Settings } from "./routes/settings";

export const App = (): React.JSX.Element => (
  <AdapterProvider value={localAdapter}>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/notes" element={<Notes />}>
          <Route path="*" element={<NoteEditor />} />
        </Route>
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  </AdapterProvider>
);
