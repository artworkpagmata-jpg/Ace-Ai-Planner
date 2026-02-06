
import React, { useMemo } from 'react';
import { parse } from 'marked';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

// Fix: Added the missing component logic and default export to ensure it can be imported in App.tsx.
const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = "" }) => {
  const htmlContent = useMemo(() => {
    try {
      // Ensure markdown is parsed with gfm (GitHub Flavored Markdown) for tables
      return parse(content) as string;
    } catch (e) {
      console.error("Markdown parse error:", e);
      return content;
    }
  }, [content]);

  return (
    <div 
      className={`markdown-renderer prose prose-invert max-w-none ${className}`}
      style={{
        '--tw-prose-body': '#d1d5db',
        '--tw-prose-headings': '#ffffff',
        '--tw-prose-links': '#f4511e',
      } as React.CSSProperties}
    >
      <style>{`
        .markdown-renderer table {
          width: 100%;
          border-collapse: collapse;
          border: 1px solid #4b5563;
          margin: 1.5rem 0;
          font-size: 0.825rem;
          table-layout: auto;
        }
        .markdown-renderer th, 
        .markdown-renderer td {
          border: 1px solid #4b5563;
          padding: 0.75rem;
          text-align: left;
          vertical-align: top;
          word-wrap: break-word;
          min-width: 150px;
        }
        .markdown-renderer th {
          background-color: rgba(244, 81, 30, 0.1);
          color: #f4511e;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-size: 0.7rem;
        }
        .markdown-renderer tr:hover {
          background-color: rgba(255, 255, 255, 0.03);
        }
        .markdown-renderer h1, 
        .markdown-renderer h2, 
        .markdown-renderer h3 {
          text-transform: uppercase;
          letter-spacing: -0.01em;
          margin-top: 1.5rem;
          color: #f4511e;
        }
        .markdown-renderer strong {
          color: #f4511e;
          font-weight: 800;
        }
        /* Style for the 'Component' column or first column */
        .markdown-renderer td:first-child {
          font-weight: 700;
          background-color: rgba(255, 255, 255, 0.01);
          width: 180px;
        }

        @media print {
          .markdown-renderer table {
            border: 1pt solid black !important;
            color: black !important;
            background-color: white !important;
          }
          .markdown-renderer th, 
          .markdown-renderer td {
            border: 1pt solid black !important;
            color: black !important;
            padding: 5pt !important;
          }
          .markdown-renderer th {
            background-color: #f3f3f3 !important;
            color: black !important;
          }
          .markdown-renderer h1, 
          .markdown-renderer h2, 
          .markdown-renderer h3,
          .markdown-renderer strong {
            color: black !important;
          }
        }
      `}</style>
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </div>
  );
};

export default MarkdownRenderer;
