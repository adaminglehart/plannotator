import React from 'react';
import { InlineMarkdown } from '../InlineMarkdown';

interface CalloutProps {
  blockId: string;
  kind: string;
  body: string;
  containerClassName: string;
  blockType: 'alert' | 'directive';
  kindAttribute: string;
  onOpenLinkedDoc?: (path: string) => void;
  imageBaseDir?: string;
  onImageClick?: (src: string, alt: string) => void;
  githubRepo?: string;
}

export const Callout: React.FC<CalloutProps> = ({
  blockId,
  kind,
  body,
  containerClassName,
  blockType,
  kindAttribute,
  onOpenLinkedDoc,
  imageBaseDir,
  onImageClick,
  githubRepo,
}) => {
  const paragraphs = body.split(/\n\n+/);
  const kindAttr =
    blockType === 'alert' ? { 'data-alert-kind': kindAttribute } : { 'data-directive-kind': kindAttribute };
  return (
    <div
      className={containerClassName}
      data-block-id={blockId}
      data-block-type={blockType}
      {...kindAttr}
    >
      <div className={`${blockType}-title text-xs font-semibold uppercase tracking-wide mb-1`}>
        {kind}
      </div>
      {paragraphs.map((para, i) =>
        para ? (
          <p key={i} className={`text-[15px] leading-relaxed ${i > 0 ? 'mt-2' : ''}`}>
            <InlineMarkdown
              imageBaseDir={imageBaseDir}
              onImageClick={onImageClick}
              text={para}
              onOpenLinkedDoc={onOpenLinkedDoc}
              githubRepo={githubRepo}
            />
          </p>
        ) : null,
      )}
    </div>
  );
};
