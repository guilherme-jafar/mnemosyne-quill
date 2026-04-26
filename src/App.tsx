import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AdapterProvider } from "./context/adapter-context";
import { stubAdapter } from "./adapters/stub-adapter";
import { Home } from "./routes/home";
import { Notes } from "./routes/notes";
import { NoteEditor } from "./routes/note-editor";

export const App = (): React.JSX.Element => (
  <AdapterProvider value={stubAdapter}>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/notes" element={<Notes />}>
          <Route path="*" element={<NoteEditor />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </AdapterProvider>
);
