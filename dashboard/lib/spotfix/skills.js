/**
 * Loads this project's own test-authoring standards and turns them into
 * constraints on a proposed fix.
 *
 * The repo documents its architecture in `.mcp-context/skills/*.md` — tests
 * call business functions, business functions compose page objects, page
 * objects own every locator and every wait, and locators are declared once at
 * the class top using getByRole/getByLabel/getByTestId/getByText. Until now
 * the spot-fix engine had never read any of it. It was free to (and would)
 * propose a raw `page.locator(...)` inside a spec file: a change that makes
 * the test green while quietly demolishing the layering the suite is built
 * on, and that no reviewer skimming a two-line diff would necessarily catch.
 *
 * Two things are needed and only one of them is this file. Showing a model the
 * rules is necessary but demonstrably not sufficient — this codebase already
 * learned that with swallowed failures, where a model read the warning and
 * proposed the flagged change anyway (see ./swallowedFailures.js). So the
 * rules go in the prompt from here, and the ones that can be checked
 * mechanically are *also* enforced in ./layering.js against the actual edit.
 *
 * Only the directive lines are extracted, not the whole documents: the full
 * skill set is ~15k characters, and this prompt shares a per-minute token
 * budget with RCA on a free tier (see MAX_SNAPSHOT_CHARS in ./prompt.js).
 */
const fs = require('fs');
const path = require('path');
const { REPO_ROOT, DASHBOARD_ROOT } = require('../paths');

// Searched in order; every directory that exists contributes. `.skill` archives
// (zipped SKILL.md bundles, as in the repo-root skills/ folder) are skipped —
// those describe developer personas, not test-authoring rules.
const SKILL_DIRS = [
  path.join(REPO_ROOT, '.mcp-context', 'skills'),
  path.join(REPO_ROOT, 'skills'),
  path.join(REPO_ROOT, '.claude', 'skills'),
];

// A curated override: if this exists, it replaces extraction entirely, so a
// team can hand-write exactly what the fixer should be told.
const OVERRIDE_FILE = path.join(DASHBOARD_ROOT, 'config', 'fix-conventions.md');

const MAX_RULES = 26;
const MAX_CHARS = 2200;

// The lines worth extracting from a skill document: an explicit **Rule**,
// an enforcement-checklist item, or a directive bullet. Prose, examples and
// the ❌/✅ code blocks around them are left out — the rule line always
// restates the point of its example.
const RULE_RE = /^\s*\*\*Rule\*\*:\s*(.+?)\s*$/;
const CHECKLIST_RE = /^\s*-\s*\[[ x]\]\s*(.+?)\s*$/i;
const DIRECTIVE_RE = /^\s*[-*]\s*((?:DO NOT|DO not|Do not|DON'T|NEVER|NO |ALL |Keep |Use |Reuse |Define |Handle |Avoid |Always )[^\n]+?)\s*$/;

const normalize = (text) => text.replace(/\s+/g, ' ').replace(/[.\s]+$/, '').trim();

function extractRules(markdown) {
  const rules = [];
  let inFence = false;
  for (const line of markdown.split('\n')) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue; // the ❌ FORBIDDEN examples — the Rule line says it better

    const match = line.match(RULE_RE) || line.match(CHECKLIST_RE) || line.match(DIRECTIVE_RE);
    if (!match) continue;
    const text = normalize(match[1]);
    // Skip fragments that only make sense next to their example.
    if (text.length < 12 || text.startsWith('Example')) continue;
    rules.push(text);
  }
  return rules;
}

function listSkillFiles() {
  const files = [];
  for (const dir of SKILL_DIRS) {
    let entries;
    try {
      entries = fs.readdirSync(dir);
    } catch {
      continue;
    }
    for (const name of entries.sort()) {
      if (name.toLowerCase().endsWith('.md')) files.push(path.join(dir, name));
    }
  }
  return files;
}

let cached = null;

/**
 * { rules: string[], sources: string[], text: string } — `text` is the
 * prompt-ready block, empty when the project documents no standards (in which
 * case the fixer behaves exactly as it did before this existed).
 */
function loadFixConventions() {
  if (cached) return cached;

  let override = null;
  try {
    override = fs.readFileSync(OVERRIDE_FILE, 'utf-8');
  } catch {
    /* no override — extract from the skill documents */
  }

  const sources = [];
  const seen = new Set();
  const rules = [];

  const collect = (markdown, label) => {
    let added = false;
    for (const rule of extractRules(markdown)) {
      const key = rule.toLowerCase();
      if (seen.has(key)) continue; // the skill files repeat rules across documents by design
      seen.add(key);
      rules.push(rule);
      added = true;
    }
    if (added) sources.push(label);
  };

  if (override != null) {
    collect(override, path.relative(REPO_ROOT, OVERRIDE_FILE).split(path.sep).join('/'));
  } else {
    for (const file of listSkillFiles()) {
      let content;
      try {
        content = fs.readFileSync(file, 'utf-8');
      } catch {
        continue;
      }
      collect(content, path.relative(REPO_ROOT, file).split(path.sep).join('/'));
    }
  }

  const kept = [];
  let chars = 0;
  for (const rule of rules) {
    if (kept.length >= MAX_RULES || chars + rule.length > MAX_CHARS) break;
    kept.push(rule);
    chars += rule.length;
  }

  cached = {
    rules: kept,
    sources,
    truncated: kept.length < rules.length,
    text: kept.length ? renderBlock(kept, sources) : '',
  };
  return cached;
}

function renderBlock(rules, sources) {
  return `THIS PROJECT'S TEST ARCHITECTURE RULES (from ${sources.join(', ')}) — YOUR FIX MUST OBEY THESE
${rules.map((r) => `- ${r}`).join('\n')}

These are not style preferences; they are the layering the suite depends on, and a fix that breaks one is rejected or flagged before a human sees it. Concretely, for the change you are about to propose: a locator belongs in the page object that owns it, declared once with the rest of that class's locators — never inline inside a method, never in a business function, and never in a spec file. If fixing this failure properly requires a new locator, add it where that class declares its others and reference it from the method, rather than inlining a selector at the point of use.`;
}

/** Test seam — the skill documents are read from disk once per process. */
function resetFixConventions() {
  cached = null;
}

module.exports = { loadFixConventions, resetFixConventions, extractRules, OVERRIDE_FILE };
