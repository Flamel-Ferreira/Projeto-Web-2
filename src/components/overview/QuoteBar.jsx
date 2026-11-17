/** Faixa final: citação fixa à esquerda e a versão do app à direita (RN-56). */
export default function QuoteBar({ quote, author, version }) {
  return (
    <aside className="quote-bar">
      <figure className="quote-bar__quote">
        <blockquote className="quote-bar__text">“{quote}”</blockquote>
        <figcaption className="quote-bar__author">— {author}</figcaption>
      </figure>
      <p className="quote-bar__version">{version}</p>
    </aside>
  );
}
