import { useState } from 'react';

export function CopyButton({ value, label = 'Copy' }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API unavailable (e.g. insecure context) — nothing sensible to fall back to.
    }
  }

  return (
    <button type="button" className="link-button copy-button" onClick={handleCopy}>
      {copied ? 'Copied ✓' : label}
    </button>
  );
}
