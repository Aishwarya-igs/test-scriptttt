/**
 * Minimal line diff for rendering a spot-fix proposal in the UI.
 *
 * Hand-rolled rather than pulling in a diff library: the inputs here are a
 * handful of lines from one exact-match replacement, so a classic LCS table
 * is both fast enough and one fewer dependency to vet in a repo that a whole
 * QA team pulls.
 */

/** Longest-common-subsequence table over two line arrays. */
function lcsLengths(a, b) {
  const table = Array.from({ length: a.length + 1 }, () => new Uint32Array(b.length + 1));
  for (let i = a.length - 1; i >= 0; i -= 1) {
    for (let j = b.length - 1; j >= 0; j -= 1) {
      table[i][j] = a[i] === b[j] ? table[i + 1][j + 1] + 1 : Math.max(table[i + 1][j], table[i][j + 1]);
    }
  }
  return table;
}

/**
 * Returns [{ type: 'context'|'add'|'remove', text }] walking both sides.
 * Line numbers are intentionally omitted — a proposal is a replacement of one
 * unique snippet, so the surrounding file position is shown separately.
 */
function diffLines(oldText, newText) {
  const a = oldText.split('\n');
  const b = newText.split('\n');
  const table = lcsLengths(a, b);
  const rows = [];

  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      rows.push({ type: 'context', text: a[i] });
      i += 1;
      j += 1;
    } else if (table[i + 1][j] >= table[i][j + 1]) {
      rows.push({ type: 'remove', text: a[i] });
      i += 1;
    } else {
      rows.push({ type: 'add', text: b[j] });
      j += 1;
    }
  }
  while (i < a.length) {
    rows.push({ type: 'remove', text: a[i] });
    i += 1;
  }
  while (j < b.length) {
    rows.push({ type: 'add', text: b[j] });
    j += 1;
  }
  return rows;
}

module.exports = { diffLines };
