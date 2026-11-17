/**
 * Cabeçalho de página. O <h1> usa tabIndex={-1}: o AppShell leva o foco até ele
 * quando a rota muda (acessibilidade — SPEC §10).
 */
export default function PageHeader({ eyebrow, title, subtitle, action }) {
  return (
    <header className="page-header">
      <div className="page-header__text">
        {eyebrow && <p className="page-header__eyebrow">{eyebrow}</p>}
        <h1 tabIndex={-1} className="page-header__title">
          {title}
        </h1>
        {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
      </div>
      {action && <div className="page-header__action">{action}</div>}
    </header>
  );
}
