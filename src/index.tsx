/*import { setupApp } from './App';

(() => {
  const urlParams = new URLSearchParams(document.location.search);

  const config = urlParams.get('config');
  const options = JSON.parse(config);
  
  console.log(options);
  setupApp(options)
})()*/

import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);
root.render(<App />);
