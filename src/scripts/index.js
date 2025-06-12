// CSS imports
import '../styles/styles.css';
// Bootstrap imports
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import App from './pages/app';

document.addEventListener('DOMContentLoaded', async () => {
  const app = new App({
    content: document.querySelector('#main-content'),
  });

  const initialRender = async () => {
    await app.renderPage();
    // Sembunyikan loader setelah render awal selesai
    const loader = document.querySelector('.bg-loader');
    if (loader) {
      loader.style.display = 'none';
    }
  };

  window.addEventListener('load', initialRender);

  window.addEventListener('hashchange', async () => {
    await app.renderPage();
  });
});
