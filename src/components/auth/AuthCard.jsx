import { AUTH_TEXT } from '../../utils/constants.js';
import { cn } from '../../utils/cn.js';
import Brand from '../layout/Brand.jsx';
import SegmentedControl from '../ui/SegmentedControl.jsx';

const MODE_OPTIONS = [
  { value: 'login', label: AUTH_TEXT.tabLogin },
  { value: 'register', label: AUTH_TEXT.tabRegister },
];

/**
 * Card central do login/cadastro: marca, abas e formulário. As abas só pedem a
 * troca (`onModeChange`); quem navega entre /entrar e /cadastro é o AuthPage.
 * `shaking` dispara o tremor em caso de falha; `onShakeEnd` desliga o estado.
 */
export default function AuthCard({ mode, onModeChange, shaking = false, onShakeEnd, children }) {
  return (
    <div
      className={cn('auth-card', shaking && 'auth-card--shake')}
      onAnimationEnd={(event) => {
        if (event.target === event.currentTarget) onShakeEnd?.();
      }}
    >
      <div className="auth-card__brand">
        <Brand size="md" orientation="vertical" withSubtitle />
      </div>

      <SegmentedControl
        name="auth-mode"
        className="auth-card__tabs"
        options={MODE_OPTIONS}
        value={mode}
        onChange={onModeChange}
        ariaLabel={AUTH_TEXT.tabsLabel}
      />

      {children}
    </div>
  );
}
