import { Zap } from 'lucide-react';
import { APP } from '../../utils/constants.js';
import { cn } from '../../utils/cn.js';

const SIZE_CLASS = {
  sm: 'brand--sm',
  md: 'brand--md',
};

/**
 * Marca: quadrado em gradiente violeta com o raio `Zap` + nome (+ subtítulo).
 * É o único ícone do topo da sidebar (D3). `orientation="vertical"` centraliza
 * tudo, para o cabeçalho do card de login/cadastro.
 */
export default function Brand({ size = 'sm', withSubtitle = true, orientation = 'horizontal' }) {
  return (
    <div className={cn('brand', SIZE_CLASS[size], orientation === 'vertical' && 'brand--vertical')}>
      <span className="brand__logo">
        <Zap className="brand__icon" aria-hidden="true" />
      </span>
      <span className="brand__text">
        <span className="brand__name">{APP.name}</span>
        {withSubtitle && <span className="brand__tagline">{APP.tagline}</span>}
      </span>
    </div>
  );
}
