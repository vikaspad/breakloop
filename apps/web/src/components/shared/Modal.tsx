import { ReactNode } from "react";
import { C } from "../../theme";

interface ModalProps {
  onClose: () => void;
  children: ReactNode;
}

export function Modal({ onClose, children }: ModalProps) {
  return (
    <div
      style={{ position: "fixed", inset: 0, background: "#00000090", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden", maxWidth: "90vw", maxHeight: "90vh", overflowY: "auto" }}>
        {children}
      </div>
    </div>
  );
}
