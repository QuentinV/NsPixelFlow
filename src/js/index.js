import { setupApp } from './App';

(() => {
  const urlParams = new URLSearchParams(document.location.search);

  const config = urlParams.get('config');
  const options = JSON.parse(config);
  
  console.log(options);
  setupApp(options)
})()
