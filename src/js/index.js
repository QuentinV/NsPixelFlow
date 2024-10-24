import { setupApp } from './App';

(() => {
  const urlParams = new URLSearchParams(document.location.search);
  const options = {
    title: urlParams.get('title'),
    titleEnd: urlParams.get('titleEnd'),
    titleHide: urlParams.get('titleHide') ?? 1000,
    songDelay: urlParams.get('songDelay') ?? 0,
    imagesSyncUrl: urlParams.get('imgsUrl'),
    songUrl: urlParams.get('songUrl'),
    backgroundImage: urlParams.get('bgImg'),
    backgroundColor: urlParams.get('bgc'),
    startColor: urlParams.get('sc'),
    endColor: urlParams.get('ec'),
    autoMix: urlParams.get('am') ? urlParams.get('am') === 'true' : undefined,
    autoRotate: urlParams.get('ar') ? urlParams.get('ar') === 'true' : undefined,
    autoNext: urlParams.get('an') ? urlParams.get('an') === 'true' : undefined, 
    keepRotate: urlParams.get('kr') === 'true',
    rotateDuration: urlParams.get('rd'),
    rotateYoyo: urlParams.get('rYoyo') === 'true',
    w: urlParams.get('w'),
    wMin: urlParams.get('wMin'),
    wMax: urlParams.get('wMax'),
    h: urlParams.get('h'),
    hMin: urlParams.get('hMin'),
    hMax: urlParams.get('hMax'),
    d: urlParams.get('d'),
    dMin: urlParams.get('dMin'),
    dMax: urlParams.get('dMax'),
    radial: urlParams.get('r'),
    radialMin: urlParams.get('rMin'),
    radialMax: urlParams.get('rMax'),
    maxFreqValue: urlParams.get('fMax'),
    shape: urlParams.get('shape') || 'random',
    resize: urlParams.get('resize') === 'true'
  };
  console.log(options);
  setupApp(options)
})()
