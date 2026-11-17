/**
 * Rótulo de campo. Com `htmlFor` vira <label>; sem ele (grupos como
 * SegmentedControl) vira <span id> para ser usado em aria-labelledby.
 */
export default function FieldLabel({ htmlFor, id, children, hint }) {
  return (
    <div className="field__label-row">
      {htmlFor ? (
        <label htmlFor={htmlFor} id={id} className="field__label">
          {children}
        </label>
      ) : (
        <span id={id} className="field__label">
          {children}
        </span>
      )}
      {hint && <span className="field__label-hint">{hint}</span>}
    </div>
  );
}
