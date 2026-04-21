import ChordDiagram from "./ChordDiagram.jsx";

export default function ChordSheet({ usedChords }) {
  if (!usedChords || usedChords.length === 0) return null;

  return (
    <div className="mt-4 print:hidden">
      <div className="text-[9px] font-mono text-text-muted tracking-[0.2em] uppercase mb-3">
        Chords Used
      </div>
      <div className="flex flex-wrap gap-4">
        {usedChords.map((chord) => (
          <ChordDiagram key={chord} chord={chord} />
        ))}
      </div>
    </div>
  );
}
