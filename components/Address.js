import { useState } from "react";
import Icon from "./Icon";

export function shorten(value, front = 6, back = 4) {
  if (!value) return "—";
  return `${value.slice(0, front)}…${value.slice(-back)}`;
}

export default function Address({ value, label, copy = true }) {
  const [copied, setCopied] = useState(false);
  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1300);
    } catch {}
  }
  return (
    <span className="addressChip" title={value}>
      {label || shorten(value)}
      {copy && (
        <button type="button" onClick={copyAddress} aria-label="Copy address">
          <Icon name={copied ? "check" : "copy"} size={14} />
        </button>
      )}
    </span>
  );
}
