"use client";

import { useState } from "react";

export function DescriptionText({
  text,
  initialChars = 100,
  heightPx = 96,
}: {
  text: string;
  initialChars?: number;
  heightPx?: number;
}) {
  const [expanded, setExpanded] = useState(false);

  const isLong = text.length > initialChars;
  const shown =
    expanded || !isLong ? text : text.slice(0, initialChars).trimEnd();

  return (
    <div
      style={{ height: `${heightPx}px` }}
      className={expanded ? "overflow-auto pr-1" : "overflow-hidden"}
    >
      <p className="text-sm text-muted-foreground leading-relaxed inline whitespace-pre-wrap">
        {shown}
        {!expanded && isLong ? "…" : ""}
      </p>
      {isLong && (
        <button
          type="button"
          className="ml-1 text-xs font-medium text-[var(--primary)] hover:underline align-baseline"
          onClick={() => setExpanded((v) => !v)}
          aria-label={expanded ? "Show less" : "Show more"}
        >
          {expanded ? "less" : "more"}
        </button>
      )}
    </div>
  );
}
