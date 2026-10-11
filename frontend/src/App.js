import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ExamProvider } from "./context/ExamContext";
import { Toaster } from "./components/ui/toaster";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import PreExam from "./pages/PreExam";
import ExamScreen from "./pages/ExamScreen";
import ResultScreen from "./pages/ResultScreen";
import EssaySelect from "./pages/EssaySelect";
import EssayScreen from "./pages/EssayScreen";
import Report from "./pages/Report";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";

function App() {
  return (
    <div className="App">
      <ExamProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/pre-exam/:subjectId" element={<PreExam />} />
            <Route path="/exam/:subjectId" element={<ExamScreen />} />
            <Route path="/result" element={<ResultScreen />} />
            <Route path="/esai" element={<EssaySelect />} />
            <Route path="/esai/:subjectId" element={<EssayScreen />} />
            <Route path="/rapor" element={<Report />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
      </ExamProvider>
    </div>
  );
}

export default App;
