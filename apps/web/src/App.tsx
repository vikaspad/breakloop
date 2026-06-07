import { useEffect, useState } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { Setup } from "./pages/Setup";
import { Login } from "./pages/Login";
import { useAuthStore } from "./store/authStore";
import { api } from "./api/client";
import { C } from "./theme";

export default function App() {
  const { isAuthenticated } = useAuthStore();
  const [setupComplete, setSetupComplete] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSetup();
  }, []);

  const checkSetup = async () => {
    try {
      console.log("[APP] Checking setup status...");
      const res = await api.setup.check();
      const isComplete = res.data.isSetupComplete;
      console.log("[APP] Setup status:", isComplete ? "COMPLETE" : "INCOMPLETE");
      setSetupComplete(isComplete);
    } catch (err) {
      console.error("[APP] Failed to check setup:", err);
      // Assume setup not complete if we can't check
      setSetupComplete(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: C.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <div style={{ color: C.textDim, fontSize: 12 }}>Loading...</div>
      </div>
    );
  }

  if (!setupComplete) return <Setup />;
  if (!isAuthenticated()) return <Login />;
  return <RouterProvider router={router} />;
}
