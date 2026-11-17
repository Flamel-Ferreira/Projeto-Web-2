import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' mantém os assets relativos: o build estático funciona em qualquer
// hospedagem/subpasta (junto com o HashRouter, que dispensa regra de fallback).
export default defineConfig({
  base: './',
  plugins: [react()],
});
