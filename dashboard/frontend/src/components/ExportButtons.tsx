export function ExportButtons({
  onExportPDF,
  onExportCSV,
  onEmail,
  emailBusy,
  disabled,
}: {
  onExportPDF?: () => void;
  onExportCSV?: () => void;
  onEmail?: () => void;
  emailBusy?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="export-buttons">
      {onExportPDF && (
        <button type="button" className="secondary-button" onClick={onExportPDF} disabled={disabled}>
          <span aria-hidden="true">⇩</span> PDF
        </button>
      )}
      {onEmail && (
        <button type="button" className="secondary-button" onClick={onEmail} disabled={disabled || emailBusy}>
          <span aria-hidden="true">✉</span> {emailBusy ? 'Sending…' : 'Email'}
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
