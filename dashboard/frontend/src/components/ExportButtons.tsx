export function ExportButtons({
  onExportPDF,
  onExportCSV,
  disabled,
}: {
  onExportPDF?: () => void;
  onExportCSV?: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="export-buttons">
      {onExportPDF && (
        <button type="button" className="secondary-button" onClick={onExportPDF} disabled={disabled}>
          <span aria-hidden="true">⇩</span> PDF
        </button>
      )}
      {onExportCSV && (
        <button type="button" className="secondary-button" onClick={onExportCSV} disabled={disabled}>
          <span aria-hidden="true">⇩</span> Excel
        </button>
      )}
    </div>
  );
}
