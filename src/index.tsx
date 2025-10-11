/* @refresh reload */
import { render } from 'solid-js/web';

import './index.css';
import App from './App';
import { initSound } from './instruments';

const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?'
  );
}

document.addEventListener('click', initSound);

// biome-ignore lint/style/noNonNullAssertion: we know that root exist in index.html
render(() => <App />, root!);
