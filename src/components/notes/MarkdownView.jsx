import ReactMarkdown from 'react-markdown';

const components = {
  h1: (p) => <h2 className="mb-4 mt-8 text-2xl font-semibold text-text" {...p} />,
  h2: (p) => <h3 className="mb-3 mt-8 text-xl font-semibold text-text" {...p} />,
  h3: (p) => <h3 className="mb-3 mt-8 text-xl font-semibold text-text" {...p} />,
  h4: (p) => <h4 className="mb-2 mt-6 text-base font-semibold text-text" {...p} />,
  p: (p) => <p className="mb-5 text-[15px] leading-[1.75] text-[#C9C9CE]" {...p} />,
  ul: (p) => <ul className="mb-5 list-disc space-y-2 pl-6 text-[15px] leading-[1.75] text-[#C9C9CE] marker:text-primary" {...p} />,
  ol: (p) => <ol className="mb-5 list-decimal space-y-2 pl-6 text-[15px] leading-[1.75] text-[#C9C9CE] marker:text-primary" {...p} />,
  li: (p) => <li className="pl-1" {...p} />,
  strong: (p) => <strong className="font-semibold text-text" {...p} />,
  a: (p) => <a className="text-primary-light underline underline-offset-2 hover:text-text" target="_blank" rel="noopener noreferrer" {...p} />,
  blockquote: (p) => <blockquote className="mb-5 border-l-2 border-primary/50 pl-4 italic text-text-secondary" {...p} />,
  hr: () => <hr className="my-8 border-white/10" />,
  code: ({ inline, className, children, ...p }) =>
    inline || !String(children).includes('\n') ? (
      <code className="rounded bg-surface-3 px-1.5 py-0.5 font-mono text-[13px] text-primary-light" {...p}>
        {children}
      </code>
    ) : (
      <code className={`font-mono text-[13px] ${className ?? ''}`} {...p}>
        {children}
      </code>
    ),
  pre: (p) => <pre className="mb-5 overflow-x-auto rounded-xl border border-border bg-[#0B0B0C] p-4 text-[#C9C9CE]" {...p} />,
};

export default function MarkdownView({ content }) {
  return (
    <div className="break-words">
      <ReactMarkdown components={components}>{content}</ReactMarkdown>
    </div>
  );
}
