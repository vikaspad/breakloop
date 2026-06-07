import { createBrowserRouter } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { Dashboard } from "./pages/Dashboard";
import { AgentRegistry } from "./pages/AgentRegistry";
import { TestSuites } from "./pages/TestSuites";
import { RunCenter } from "./pages/RunCenter";
import { Reports } from "./pages/Reports";
import { Failures } from "./pages/Failures";
import { History } from "./pages/History";
import { Settings } from "./pages/Settings";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "agents", element: <AgentRegistry /> },
      { path: "suites", element: <TestSuites /> },
      { path: "run", element: <RunCenter /> },
      { path: "history", element: <History /> },
      { path: "reports", element: <Reports /> },
      { path: "failures", element: <Failures /> },
      { path: "settings", element: <Settings /> },
    ],
  },
]);
