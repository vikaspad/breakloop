import { C } from "../../theme";
import { Tag } from "../shared/Tag";
import { TestSuite } from "../../types";

interface Props {
  suites: TestSuite[];
  selected: TestSuite | null;
  onSelect: (s: TestSuite) => void;
}

export function SuiteSelector({ suites, selected, onSelect }: Props) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 16px" }}>
      <div style={{ fontSize: 9, color: C.textDim, letterSpacing: "0.1em", marginBottom: 10 }}>TEST SUITE</div>
      {suites.map(s => (
        <div key={s.id} onClick={() => onSelect(s)} style={{
          display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 7, cursor: "pointer",
          background: selected?.id === s.id ? C.blueDim : C.surface,
          border: `1px solid ${selected?.id === s.id ? C.blue + "50" : C.border}`,
          marginBottom: 5, transition: "all 0.2s",
        }}>
          <span style={{ fontSize: 9, color: C.blue }}>⬡</span>
          <span style={{ fontSize: 11, color: selected?.id === s.id ? C.blue : C.textSub, flex: 1 }}>{s.name}</span>
          <Tag label={`${s._count?.cases ?? s.cases?.length ?? 0} cases`} />
        </div>
      ))}
      {suites.length === 0 && <div style={{ fontSize: 11, color: C.textDim, padding: "12px 0", textAlign: "center" }}>No test suites yet</div>}
    </div>
  );
}
