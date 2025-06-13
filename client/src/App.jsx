import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Trash from "./pages/Trash";
import NewProject from "./pages/NewProject";
// import ThemeSelect from "./pages/ThemeSelect";
// import Editor from "./pages/Editor";

export default function App() {
  return (
    <Router>
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/trash" element={<Trash />} />
        <Route path="/new" element={<NewProject />} />
        {/* <Route path="/themes" element={<ThemeSelect />} />
        <Route path="/editor" element={<Editor />} /> */}
      </Routes>
    </Router>
  );
}
