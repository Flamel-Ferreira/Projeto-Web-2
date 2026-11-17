import { HashRouter } from 'react-router-dom';
import AppProviders from './context/AppProviders.jsx';
import AppRoutes from './routes/AppRoutes.jsx';

// HashRouter: o build estático funciona em qualquer host, sem regra de fallback (D8).
// Para BrowserRouter, troque apenas o import e o componente abaixo.
export default function App() {
  return (
    <HashRouter>
      <AppProviders>
        <AppRoutes />
      </AppProviders>
    </HashRouter>
  );
}
