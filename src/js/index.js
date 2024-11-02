import { setupApp } from './App';

(() => {
  const urlParams = new URLSearchParams(document.location.search);
  const options = {
    startBtn: urlParams.get('startBtn') === 'true',
    title: urlParams.get('title'),
    titleEnd: urlParams.get('titleEnd'),
    titleHide: urlParams.get('titleHide') ?? 1000,
    songDelay: urlParams.get('songDelay') ?? 0,
    songUrl: urlParams.get('songUrl'),

    shape: urlParams.getAll('shape'),
    imagesSyncUrl: urlParams.get('imgsUrl'),

    backgroundImage: urlParams.get('bgImg'),
    backgroundColor: urlParams.get('bgc'),
    resize: urlParams.get('resize') === 'true',
    maxFreqValue: urlParams.get('fMax'),
    
    increaseDetails: urlParams.getAll('incd'),
    startColor: urlParams.getAll('sc'),
    endColor: urlParams.getAll('ec'),
    autoMix: urlParams.getAll('am'),
    autoRotate: urlParams.getAll('ar'),
    autoNext: urlParams.getAll('an'),
    keepRotate: urlParams.getAll('kr'),
    rotateDuration: urlParams.getAll('rd'),
    rotateYoyo: urlParams.getAll('rYoyo'),
    w: urlParams.getAll('w'),
    wMin: urlParams.getAll('wMin'),
    wMax: urlParams.getAll('wMax'),
    h: urlParams.getAll('h'),
    hMin: urlParams.getAll('hMin'),
    hMax: urlParams.getAll('hMax'),
    d: urlParams.getAll('d'),
    dMin: urlParams.getAll('dMin'),
    dMax: urlParams.getAll('dMax'),
    radial: urlParams.getAll('r'),
    radialMin: urlParams.getAll('rMin'),
    radialMax: urlParams.getAll('rMax'),
    posZ: urlParams.getAll('z'),
    viewWidth: urlParams.getAll('vw'),
    viewHeight: urlParams.getAll('vh')
  };
  console.log(options);
  setupApp(options)
})()
