import { useState } from "react";
import AdminMessageConsole from "@/pages/AdminMessageConsole";
import ExamAdminDashboard from "@/pages/ExamAdminDashboard";
import Home from "@/pages/Home";
import { PreferencesProvider } from "@/settings/preferences";

export type PageType = "records" | "insight" | "mine";

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>("records");
  const isExamAdmin =
    typeof window !== "undefined" && window.location.pathname === "/admin";
  const isAdminConsole =
    typeof window !== "undefined" &&
    (window.location.pathname === "/sendtest" ||
      window.location.search.includes("admin=1"));

  return (
    <PreferencesProvider>
      {isExamAdmin ? (
        <ExamAdminDashboard />
      ) : isAdminConsole ? (
        <AdminMessageConsole />
      ) : (
        <Home currentPage={currentPage} onNavigate={setCurrentPage} />
      )}
    </PreferencesProvider>
  );
}
