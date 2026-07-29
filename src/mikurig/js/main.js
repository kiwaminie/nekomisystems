import { InitializeRender, resetModel } from './render.js';

InitializeRender().catch((error) => {
  console.error('Error al iniciar Mikurig:', error);
});

// Exponer el reset para que el botón HTML pueda llamarlo
window.resetMikurig = () => resetModel();
