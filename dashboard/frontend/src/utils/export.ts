import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import type { RunRecord, TestRecord } from '../api/types';
import { formatDuration, relativeTime, runDuration, type TestHistoryEntry } from './runStats';

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function csvCell(value: unknown): string {
  const str = value == null ? '' : String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

function toCSV(headers: string[], rows: unknown[][]): string {
  const lines = [headers, ...rows].map((row) => row.map(csvCell).join(','));
  // BOM so Excel detects UTF-8 instead of mangling non-ASCII characters.
  return `﻿${lines.join('\r\n')}`;
}

function shortId(runId: string) {
  return runId.slice(0, 8);
}

/** Downloads every currently-visible run in the history list as a spreadsheet. */
export function exportRunsCSV(runs: RunRecord[]) {
  const headers = ['Run ID', 'Project', 'Environment', 'Trigger', 'Status', 'Passed', 'Failed', 'Skipped', 'Duration', 'Started'];
  const rows = runs.map((r) => [
    r.runId,
    r.trigger.project ?? 'All projects',
    r.trigger.env,
    r.trigger.grep ? `${r.trigger.type} (${r.trigger.grep})` : r.trigger.type,
    r.status,
    r.stats.passed,
    r.stats.failed,
    r.stats.skipped,
    formatDuration(runDuration(r)),
    r.createdAt,
  ]);
  triggerDownload(new Blob([toCSV(headers, rows)], { type: 'text/csv;charset=utf-8' }), `tfc-run-history-${Date.now()}.csv`);
}

function testRows(tests: TestRecord[]) {
  return tests.map((t) => [
    t.title,
    t.project ?? '–',
    t.file.split(/[\\/]/).pop() ?? t.file,
    t.line,
    t.status,
    formatDuration(t.duration),
    t.error?.message ?? '',
  ]);
}

/** Downloads the full test table for a single run as a spreadsheet. */
export function exportRunCSV(run: RunRecord) {
  const tests = Object.values(run.tests);
  const headers = ['Test', 'Project', 'File', 'Line', 'Status', 'Duration', 'Error'];
  triggerDownload(
    new Blob([toCSV(headers, testRows(tests))], { type: 'text/csv;charset=utf-8' }),
    `tfc-run-${shortId(run.runId)}.csv`,
  );
}

/**
 * Builds the printable summary + full results PDF report for a single run
 * and returns the jsPDF document, without saving it — shared by
 * exportRunPDF (downloads it) and buildRunPDFBase64 (hands it to the Email
 * button, which needs the raw bytes to attach rather than a browser
 * download). `clientName` (from /api/client-info) and `chartsEl` (a ref to
 * the live Result breakdown/Slowest tests charts) are both optional and
 * purely additive — everything that was already in this report (title,
 * summary facts, full results table with the same status colors) is still
 * here when neither is provided; they're just laid out on the same first
 * page instead of a plain top-to-bottom text dump, so the header/summary/
 * charts read as one page of context instead of spilling onto a dedicated
 * charts page.
 */
async function buildRunPDFDoc(run: RunRecord, opts?: { clientName?: string | null; chartsEl?: HTMLElement | null }) {
  const tests = Object.values(run.tests);
  const doc = new jsPDF();
  const marginX = 14;
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - marginX * 2;

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('I Want TFC — Playwright Run Report', marginX, 18);
  doc.setFont('helvetica', 'normal');

  let cursorY = 26;
  if (opts?.clientName) {
    doc.setFontSize(12);
    doc.setTextColor(42, 120, 214);
    doc.text(`Client: ${opts.clientName}`, marginX, cursorY);
    doc.setTextColor(0);
    cursorY += 8;
  }

  // A two-column key/value grid (via autoTable, borderless) instead of
  // manually-spaced text: fixed-width columns are what actually keeps
  // labels and values lined up — padding a proportional font's text with
  // literal spaces doesn't, since "Project:" and "Status:" aren't the same
  // rendered width.
  const summaryRows: [string, string][] = [
    ['Project', run.trigger.project ?? 'All projects'],
    ['Environment', run.trigger.env],
    ['Status', run.status],
    ['Duration', formatDuration(runDuration(run))],
    ['Started', `${new Date(run.createdAt).toLocaleString()} (${relativeTime(run.createdAt)})`],
    ['Results', `${run.stats.passed} passed · ${run.stats.failed} failed · ${run.stats.skipped} skipped`],
    ['Run ID', run.runId],
  ];
  autoTable(doc, {
    startY: cursorY,
    body: summaryRows,
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: { top: 1.5, bottom: 1.5, left: 0, right: 4 }, textColor: 40 },
    columnStyles: {
      0: { cellWidth: 28, fontStyle: 'bold', textColor: 90 },
      1: { cellWidth: contentWidth - 28 },
    },
    margin: { left: marginX, right: marginX },
  });
  // @ts-expect-error jspdf-autotable attaches lastAutoTable at runtime
  cursorY = doc.lastAutoTable.finalY + 6;

  if (opts?.chartsEl) {
    try {
      // A real screenshot of the live charts (same colors/theme the page is
      // showing right now), not a redrawn approximation — html2canvas reads
      // computed styles, which a hand-serialized SVG data URL wouldn't (the
      // chart colors are CSS custom properties, invisible outside the
      // page's own stylesheet context).
      const canvas = await html2canvas(opts.chartsEl, { backgroundColor: null, scale: 2 });
      const maxHeight = 62;
      const widthAtMaxHeight = (canvas.width / canvas.height) * maxHeight;
      const imgWidth = Math.min(contentWidth, widthAtMaxHeight);
      const imgHeight = (canvas.height / canvas.width) * imgWidth;
      const imgX = marginX + (contentWidth - imgWidth) / 2;
      doc.addImage(canvas.toDataURL('image/png'), 'PNG', imgX, cursorY, imgWidth, imgHeight);
      cursorY += imgHeight + 8;
    } catch {
      // A capture failure (e.g. an ad blocker interfering with canvas
      // tainting checks) should never block the rest of the report from
      // downloading — the summary/table are already complete either way.
    }
  }

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Test Results', marginX, cursorY + 4);
  doc.setFont('helvetica', 'normal');
  cursorY += 9;

  autoTable(doc, {
    startY: cursorY,
    head: [['Test', 'Project', 'Status', 'Duration', 'Error']],
    body: tests.map((t) => [
      t.title,
      t.project ?? '–',
      t.status,
      formatDuration(t.duration),
      t.error?.message ?? '',
    ]),
    styles: { fontSize: 8, cellPadding: 3, overflow: 'linebreak' },
    headStyles: { fillColor: [42, 120, 214] },
    columnStyles: {
      0: { cellWidth: 65 },
      4: { cellWidth: 55 },
    },
    margin: { left: marginX, right: marginX },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 2) {
        const status = String(data.cell.raw);
        if (status === 'passed') data.cell.styles.textColor = [12, 163, 12];
        else if (status === 'skipped') data.cell.styles.textColor = [137, 135, 129];
        else data.cell.styles.textColor = [208, 59, 59];
      }
    },
  });

  return doc;
}

/** Renders and downloads the run report PDF (see buildRunPDFDoc). */
export async function exportRunPDF(run: RunRecord, opts?: { clientName?: string | null; chartsEl?: HTMLElement | null }) {
  const doc = await buildRunPDFDoc(run, opts);
  doc.save(`tfc-run-${shortId(run.runId)}.pdf`);
}

/**
 * Same report as exportRunPDF, but returned as base64 + a filename instead
 * of triggering a browser download — for the Email button, which sends it
 * to the server as a SendGrid attachment.
 */
export async function buildRunPDFBase64(run: RunRecord, opts?: { clientName?: string | null; chartsEl?: HTMLElement | null }) {
  const doc = await buildRunPDFDoc(run, opts);
  const dataUri = doc.output('datauristring');
  const base64 = dataUri.slice(dataUri.indexOf('base64,') + 'base64,'.length);
  return { base64, filename: `tfc-run-${shortId(run.runId)}.pdf` };
}

/** Renders the Overview page's KPIs + flaky/top-failing insights + recent runs as a PDF snapshot. */
export function exportOverviewPDF(params: {
  totalRuns: number;
  passRate: number | null;
  activeCount: number;
  flaky: TestHistoryEntry[];
  topFailing: TestHistoryEntry[];
  recentRuns: RunRecord[];
}) {
  const { totalRuns, passRate, activeCount, flaky, topFailing, recentRuns } = params;
  const doc = new jsPDF();
  const marginX = 14;

  doc.setFontSize(16);
  doc.text('I Want TFC — Dashboard Overview', marginX, 18);

  doc.setFontSize(10);
  doc.setTextColor(90);
  doc.text(`Generated ${new Date().toLocaleString()}`, marginX, 25);
  doc.setTextColor(0);

  doc.setFontSize(11);
  doc.text(
    `Total runs: ${totalRuns}    Pass rate (recent): ${passRate == null ? '–' : `${passRate}%`}    Active now: ${activeCount}    Flaky tests: ${flaky.length}`,
    marginX,
    34,
  );

  let cursorY = 42;

  if (flaky.length > 0) {
    doc.setFontSize(12);
    doc.text('Flaky tests', marginX, cursorY);
    autoTable(doc, {
      startY: cursorY + 4,
      head: [['Test', 'File', 'Passed', 'Failed']],
      body: flaky.map((t) => [t.title, t.file.split(/[\\/]/).pop() ?? t.file, t.passCount, t.failCount]),
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [250, 178, 25] },
    });
    // @ts-expect-error jspdf-autotable attaches lastAutoTable at runtime
    cursorY = doc.lastAutoTable.finalY + 10;
  }

  if (topFailing.length > 0) {
    doc.setFontSize(12);
    doc.text('Most-failing tests', marginX, cursorY);
    autoTable(doc, {
      startY: cursorY + 4,
      head: [['Test', 'File', 'Failures']],
      body: topFailing.map((t) => [t.title, t.file.split(/[\\/]/).pop() ?? t.file, t.failCount]),
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [208, 59, 59] },
    });
    // @ts-expect-error jspdf-autotable attaches lastAutoTable at runtime
    cursorY = doc.lastAutoTable.finalY + 10;
  }

  doc.setFontSize(12);
  doc.text('Recent runs', marginX, cursorY);
  autoTable(doc, {
    startY: cursorY + 4,
    head: [['Project', 'Env', 'Status', 'Passed', 'Failed', 'Skipped', 'Duration', 'Started']],
    body: recentRuns.map((r) => [
      r.trigger.project ?? 'All projects',
      r.trigger.env,
      r.status,
      r.stats.passed,
      r.stats.failed,
      r.stats.skipped,
      formatDuration(runDuration(r)),
      relativeTime(r.createdAt),
    ]),
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [42, 120, 214] },
  });

  doc.save(`tfc-dashboard-overview-${Date.now()}.pdf`);
}
