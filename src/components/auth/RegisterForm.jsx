import { useId, useState } from 'react';
import { ArrowRight, Lock, Mail, User } from 'lucide-react';
import { AUTH_TEXT } from '../../utils/constants.js';
import { validateRegisterForm } from '../../utils/validators.js';
import Button from '../ui/Button.jsx';
import Input from '../ui/Input.jsx';
import PasswordStrength from './PasswordStrength.jsx';

const FIELDS = ['name', 'email', 'password', 'confirm'];

/**
 * Formulário de cadastro: Nome (obrigatório, primeiro campo), E-mail, Senha com
 * medidor de força e Confirmar senha. Valida em tempo real: erro do campo aparece
 * depois do blur ou do envio; a confirmação é comparada assim que há texto nela.
 * `onSubmit(values)` devolve `{ ok, errors? }` (o AuthContext).
 */
export default function RegisterForm({ onSubmit, loading = false }) {
  const baseId = useId();
  const ids = Object.fromEntries(FIELDS.map((field) => [field, `${baseId}-${field}`]));

  const [values, setValues] = useState({ name: '', email: '', password: '', confirm: '' });
  const [touched, setTouched] = useState({});
  const [serverErrors, setServerErrors] = useState({});

  const localErrors = validateRegisterForm(values).errors;
  const errorFor = (field) => {
    if (serverErrors[field]) return serverErrors[field];
    const visible = touched[field] || (field === 'confirm' && values.confirm !== '');
    return visible ? localErrors[field] : undefined;
  };

  const handleChange = (field) => (event) => {
    setValues((current) => ({ ...current, [field]: event.target.value }));
    setServerErrors((current) => ({ ...current, [field]: undefined }));
  };
  const handleBlur = (field) => () => setTouched((current) => ({ ...current, [field]: true }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;

    setTouched(Object.fromEntries(FIELDS.map((field) => [field, true])));
    const result = await onSubmit(values);
    if (result.ok) return;

    const errors = result.errors ?? {};
    setServerErrors(errors);
    const target = FIELDS.find((field) => errors[field]);
    if (target) document.getElementById(ids[target])?.focus();
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <Input
        id={ids.name}
        label={AUTH_TEXT.name}
        icon={User}
        placeholder={AUTH_TEXT.namePlaceholder}
        autoComplete="name"
        value={values.name}
        onChange={handleChange('name')}
        onBlur={handleBlur('name')}
        error={errorFor('name')}
        required
        autoFocus
      />
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
      />
      <Input
        id={ids.password}
        label={AUTH_TEXT.password}
        type="password"
        icon={Lock}
        placeholder={AUTH_TEXT.registerPasswordPlaceholder}
        autoComplete="new-password"
        value={values.password}
        onChange={handleChange('password')}
        onBlur={handleBlur('password')}
        error={errorFor('password')}
        required
      />
      <PasswordStrength password={values.password} />
      <Input
        id={ids.confirm}
        label={AUTH_TEXT.confirm}
        type="password"
        icon={Lock}
        placeholder={AUTH_TEXT.confirmPlaceholder}
        autoComplete="new-password"
        value={values.confirm}
        onChange={handleChange('confirm')}
        onBlur={handleBlur('confirm')}
        error={errorFor('confirm')}
        required
      />
      <Button type="submit" size="lg" fullWidth loading={loading} iconRight={ArrowRight} className="auth-form__submit">
        {AUTH_TEXT.submitRegister}
      </Button>
    </form>
  );
}
