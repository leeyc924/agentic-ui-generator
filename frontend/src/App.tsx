import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { EditorPage } from "./pages/EditorPage";
import { PreviewPage } from "./pages/PreviewPage";
import { ProjectListPage } from "./pages/ProjectListPage";
import { AssetsPage } from "./pages/AssetsPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/editor" element={<EditorPage />} />
        <Route path="/preview/:id" element={<PreviewPage />} />
        <Route path="/projects" element={<ProjectListPage />} />
        <Route path="/assets" element={<AssetsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
