import type { Component } from 'solid-js';

import styles from './App.module.css';
import { PatternEditor } from './PatternEditor';

const App: Component = () => {
  return (
    <div class={styles.App}>
      <header class={styles.header}>MarcoTracker</header>
      <main>
        <PatternEditor />
      </main>
    </div>
  );
};

export default App;
