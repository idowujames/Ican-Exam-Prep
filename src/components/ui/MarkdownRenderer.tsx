import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="markdown-content prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          table({ children }) {
            return (
              <div className="overflow-x-auto my-4">
                <table className="min-w-full divide-y divide-gray-200 border">
                  {children}
                </table>
              </div>
            );
          },
          thead({ children }) {
            return <thead className="bg-gray-50">{children}</thead>;
          },
          th({ children }) {
            return (
              <th
                scope="col"
                className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r last:border-r-0"
              >
                {children}
              </th>
            );
          },
          td({ children }) {
            return (
              <td className="px-3 py-2 whitespace-normal break-words border-r last:border-r-0">
                {children}
              </td>
            );
          },
          p({ children }) {
            return <p className="my-2">{children}</p>;
          },
          ul({ children }) {
            return <ul className="list-disc pl-4 my-2">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="list-decimal pl-4 my-2">{children}</ol>;
          },
          li({ children }) {
            return <li className="my-1">{children}</li>;
          },
          blockquote({ children }) {
            return <blockquote className="border-l-4 border-gray-200 pl-4 py-2 my-4 italic">{children}</blockquote>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}