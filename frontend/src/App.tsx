import { Route, Routes } from "react-router-dom";
import { LibraryPage } from "./pages/LibraryPage";
import { ReaderPage } from "./pages/ReaderPage";

export default function App() {
  return (
    <div className="relative h-full w-full bg-void">
      <div className="halftone-bg" />
      <Routes>
        <Route path="/" element={<LibraryPage />} />
        <Route path="/read/:comicId" element={<ReaderPage />} />
      </Routes>
    </div>
  );
}
