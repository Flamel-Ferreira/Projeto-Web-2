import { OVERVIEW_TEXT } from '../../utils/constants.js';

/**
 * Cabeçalho da Visão Geral: "● MODO DE FOCO DISPONÍVEL", "Bom dia, {nome}" e a linha
 * "{data por extenso} • {frase do período}". O <h1> recebe o foco ao entrar na rota.
 */
export default function OverviewHeader({ greeting, name, dateLabel, periodLabel }) {
  return (
    <header className="overview-header">
      <p className="page-header__eyebrow overview-header__eyebrow">
        <span className="live-dot" aria-hidden="true" />
        {OVERVIEW_TEXT.eyebrow}
      </p>
      <h1 tabIndex={-1} className="page-header__title">
        {greeting}, {name}
      </h1>
      <p className="page-header__subtitle">
        {dateLabel} • {periodLabel}
      </p>
    </header>
  );
}
