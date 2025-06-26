import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Trash from "./pages/Trash";
import NewProject from "./pages/NewProject";
import { SidebarProvider } from "./contexts/SidebarProvider";
import ThemeSelect from "./pages/ThemeSelect";
import PresentationViewer from "./pages/PresentationViewer";
import PresentationEdit from "./pages/PresentationEdit";
// import Editor from "./pages/Editor";
// import AiGeneration from "./pages/AiGeneration"

export default function App() {
  return (
    <SidebarProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/trash" element={<Trash />} />
          <Route path="/new" element={<NewProject />} />
          <Route path="/themes" element={<ThemeSelect />} />
          <Route path="/presentation/:projectId" element={<PresentationViewer />} />
          <Route path="/edit/:projectId" element={<PresentationEdit />} />
          {/* <Route path="/generating" element={<AiGeneration />} /> */}
          {/* <Route path="/editor" element={<Editor />} /> */}
        </Routes>
      </Router>
    </SidebarProvider>
  );
}