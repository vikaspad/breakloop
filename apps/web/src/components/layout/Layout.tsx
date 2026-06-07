import { Outlet } from "react-router-dom";
import { C } from "../../theme";
import { TopBar } from "./TopBar";
import { Sidebar } from "./Sidebar";
import { OnboardWizard } from "../onboarding/OnboardWizard";
import { useUIStore } from "../../store/uiStore";
import { useAgentStore } from "../../store/agentStore";

export function Layout() {
  const { showOnboardWizard, closeWizard } = useUIStore();
  const { createAgent, pingAgent } = useAgentStore();

  const handleSave = async (dto: Parameters<typeof createAgent>[0]) => {
    try {
      console.log("[LAYOUT] Creating agent:", dto.name);
      const agent = await createAgent(dto);
      console.log("[LAYOUT] Agent created:", agent.id);

      // Ping agent to verify connection (non-fatal if fails)
      try {
        await pingAgent(agent.id);
        console.log("[LAYOUT] Agent ping successful");
      } catch (err) {
        console.warn("[LAYOUT] Agent ping failed:", err);
      }

      closeWizard();
    } catch (err) {
      console.error("[LAYOUT] Failed to save agent:", err);
      // Re-throw so OnboardWizard can display the error
      throw err;
    }
  };

  return (
    <div style={{ height: "100vh", background: C.bg, color: C.text, display: "flex", flexDirection: "column", fontFamily: "'JetBrains Mono','Courier New',monospace" }}>
      {showOnboardWizard && <OnboardWizard onSave={handleSave} onClose={closeWizard} />}
      <TopBar />
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <Sidebar />
        <main style={{ flex: 1, overflow: "auto", padding: 24 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
