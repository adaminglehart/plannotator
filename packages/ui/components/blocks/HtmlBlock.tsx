import React, { useRef, useEffect } from "react";
import { Block } from "../../types";
import { sanitizeBlockHtml } from "../../utils/sanitizeHtml";

// The inner HTML is set imperatively (not via dangerouslySetInnerHTML) so that
// React's reconciliation never replaces the rendered subtree on re-render.
// That matters because <details open> is DOM-owned state — a stray innerHTML
// re-set on every parent re-render would collapse any open <details> the
// user just opened. Paired with React.memo below so the component itself
// stops re-rendering unless the block content actually changes.
const HtmlBlockImpl: React.FC<{ block: Block }> = ({ block }) => {
  const ref = useRef<HTMLDivElement>(null);
  const sanitized = React.useMemo(
    () => sanitizeBlockHtml(block.content),
    [block.content],
  );
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== sanitized) {
      ref.current.innerHTML = sanitized;
    }
  }, [sanitized]);
  return (
    <div
      ref={ref}
      data-block-id={block.id}
      data-block-type="html"
      className="html-block my-4 text-[15px] leading-relaxed text-foreground/90"
    />
  );
};
export const HtmlBlock = React.memo(
  HtmlBlockImpl,
  (prev, next) =>
    prev.block.id === next.block.id &&
    prev.block.content === next.block.content,
);
