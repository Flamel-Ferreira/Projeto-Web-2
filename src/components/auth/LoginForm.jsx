import { useId, useState } from 'react';
import { ArrowRight, Lock, Mail } from 'lucide-react';
import { AUTH_TEXT } from '../../utils/constants.js';
import { validateLoginForm } from '../../utils/validators.js';
import Button from '../ui/Button.jsx';
import Input from '../ui/Input.jsx';

const FIELDS = ['email', 'password'];

/**
 * Formulário de login. `onSubmit(values)` deve devolver `{ ok, errors? }` (o AuthContext).
 * Erros aparecem inline depois que o campo é tocado (blur) ou o formulário é enviado;
 * erros devolvidos pelo servidor têm prioridade e somem quando o campo é editado.
 */
export default function LoginForm({ onSubmit, loading = false }) {
  const baseId = useId();
  const ids = { email: `${baseId}-email`, password: `${baseId}-password` };

  const [values, setValues] = useState({ email: '', password: '' });
  const [touched, setTouched] = useState({});
  const [serverErrors, setServerErrors] = useState({});

  const localErrors = validateLoginForm(values).errors;
  const errorFor = (field) => serverErrors[field] ?? (touched[field] ? localErrors[field] : undefined);

  const handleChange = (field) => (event) => {
    setValues((current) => ({ ...current, [field]: event.target.value }));
    setServerErrors((current) => ({ ...current, [field]: undefined }));
  };
  const handleBlur = (field) => () => setTouched((current) => ({ ...current, [field]: true }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;

    setTouched({ email: true, password: true });
    const result = await onSubmit(values);
    if (result.ok) return;

    const errors = result.errors ?? {};
    setServerErrors(errors);
    // Foco no primeiro campo com erro; falha de credenciais (sem erro de campo) → senha.
    const target = FIELDS.find((field) => errors[field]) ?? 'password';
    document.getElementById(ids[target])?.focus();
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <Input
        id={ids.email}
        label={AUTH_TEXT.email}
        type="email"
        icon={Mail}
        placeholder={AUTH_TEXT.emailPlaceholder}
        autoComplete="email"
        inputMode="email"
        value={values.email}
        onChange={handleChange('email')}
        onBlur={handleBlur('email')}
        error={errorFor('email')}
        required
        autoFocus
      />
      <Input
        id={ids.password}
        label={AUTH_TEXT.password}
        type="password"
        icon={Lock}
        placeholder={AUTH_TEXT.loginPasswordPlaceholder}
        autoComplete="current-password"
        value={values.password}
        onChange={handleChange('password')}
        onBlur={handleBlur('password')}
        error={errorFor('password')}
        required
      />
      <Button type="submit" size="lg" fullWidth loading={loading} iconRight={ArrowRight} className="auth-form__submit">
        {AUTH_TEXT.submitLogin}
      </Button>
    </form>
  );
}
