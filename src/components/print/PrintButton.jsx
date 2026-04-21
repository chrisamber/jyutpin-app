import { useState } from "react";
import { useSong } from "../../context/SongContext.jsx";
import { useApp } from "../../context/AppContext.jsx";
import { useChordEditor } from "../../hooks/useChordEditor.js";
import { exportLeadsheetPdf } from "../../services/pdfExport.js";

export default function PrintButton() {
  const { song, lines, storageId } = useSong();
  const { transpose } = useApp();
  const [exporting, setExporting] = useState(false);

  const { chordMap } = useChordEditor(storageId, 4);

  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      await exportLeadsheetPdf(song, lines, { transpose, chordMap });
    } finally {
      setExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      className="bg-accent hover:bg-accent-hover text-white font-semibold text-sm px-4 py-2 rounded-lg transition-colors print:hidden disabled:opacity-60 flex items-center gap-2"
    >
      {exporting ? (
        <>
          <span className="inline-block w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Exporting…
        </>
      ) : (
        "Export PDF"
      )}
    </button>
  );
}

