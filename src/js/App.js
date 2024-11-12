import BPMManager from './managers/BPMManager'
import AudioManager from './managers/AudioManager'
import TitleManager from './managers/TitleManager'
import WebglManager from './managers/WebglManager'
import DesignerManager from './managers/DesignerManager'

const setBackground = ({ backgroundImage, backgroundColor, backgroundStartColor, backgroundEndColor, glitch, glitchPortrait, cornersPulse }) => {
  const body = document.querySelector('body');
  if ( backgroundImage ) {
    body.style.background = `url('${backgroundImage}') center no-repeat cover`;
  }

  if ( backgroundColor ) {
    body.style.backgroundColor = backgroundColor;
  }

  if ( backgroundStartColor && backgroundEndColor ) {
    // #000022, #0f1a44
    const background = document.getElementById('background');
    background.style.background = `linear-gradient(to bottom, ${backgroundStartColor}, ${backgroundEndColor})`;
    background.style.display = "block";
  }

  if ( glitch ) {
    const glitch = document.querySelector('.glitch');
    glitch.style.display = 'block';
    if ( glitchPortrait ) {
        glitch.classList.add('glitch-portrait');
    } 
  }
  
  if ( cornersPulse ) {
    document.querySelector('.corners').style.display = 'block';
  }
}

const createContainer = ({ viewWidth, viewHeight }) => {
    const div = document.createElement('div');
    div.style.width = viewWidth || '100%';
    div.style.height = viewHeight || '100%';
    div.style.margin = 'auto';
    return div;
}

const initializeWebgls = async (options) => {
    const initTime = Date.now();

    const bpmManager = new BPMManager();
    const audioManager = new AudioManager(options);

    await audioManager.loadAudioBuffer();
    if ( options.titleEnd ) {
        audioManager.onEnded(() => {
            (new TitleManager({ text: options.titleEnd })).show();
        })
    }
    audioManager.onEnded(() => {
        setTimeout(() => {
            document.body.dispatchEvent(new Event('musicEnded'));
        }, 5000);
    })
    await bpmManager.detectBPM(audioManager.audio.buffer)

    const instancesCount = options.shape?.length ? options.shape.length : 1;
    const instances = [];

    for( let i = 0; i < instancesCount; ++i ) {   
        const rootElement = createContainer({ viewHeight: options.viewHeight[i], viewWidth: options.viewWidth[i] });
        document.getElementById('content').append(rootElement);
        const instance = new WebglManager({ rootElement, audioManager, bpmManager, options: {
            ...options,
            text: options.text[i],
            effect: options.effect[i],
            fadeOutTimer: options.fadeOutTimer[i],
            shape: options.shape[i] || 'random',
            increaseDetails: options.increaseDetails[i] || 0,
            startColor: options.startColor[i],
            endColor: options.endColor[i],
            autoMix: options.autoMix[i] ? options.autoMix[i] === 'true' : undefined,
            autoRotate: options.autoRotate[i] ? options.autoRotate[i] === 'true' : undefined,
            autoNext: options.autoNext[i] ? options.autoNext[i] === 'true' : undefined,
            keepRotate: options.keepRotate[i] === 'true',
            rotateDuration: options.rotateDuration[i],
            rotateYoyo: options.rotateYoyo[i],
            w: options.w[i],
            wMin: options.wMin[i],
            wMax: options.wMax[i],
            h: options.h[i],
            hMin: options.hMin[i],
            hMax: options.hMax[i],
            d: options.d[i],
            dMin: options.dMin[i],
            dMax: options.dMax[i],
            radial: options.radial[i],
            radialMin: options.radialMin[i],
            radialMax: options.radialMax[i],
            posZ: options.posZ[i]
        } });
        await instance.init();
        instance.resize();
        instances.push(instance);
    }   
    
    audioManager.play()
    const musicStartTime = Date.now() - initTime;
    console.log('music started after', musicStartTime);
    document.body.dispatchEvent(new CustomEvent('musicStarted', { detail: { musicStartTime } }))

    update({ audioManager, instances });

    if (options?.resize) {
        window.addEventListener('resize', () => instances.forEach( i => i.resize() ));
    }
}

const update = ({ audioManager, instances }) => {
    requestAnimationFrame(() => update({ audioManager, instances }))
    audioManager.update()
    instances.forEach( i => i.update());
}

const initialize = async options => {
    document.getElementById('startBtn').style.display = 'none';
    if ( options?.title ) {
        const titleManager = new TitleManager({ text: options.title });
        titleManager.show();
        titleManager.hideAfter(options.titleHide);
    }

    setTimeout(() => {
        initializeWebgls(options)
    }, options.songDelay);
}

export const setupApp = async options => {
    if ( localStorage.getItem("designer") === "true") {
        const designer = new DesignerManager({ id: 'designer', options });
        designer.build();
    }

    setBackground(options);
    if ( options.startBtn ) {
        document.getElementById('startBtn').onclick = () => {
            initialize(options);
        };
        document.getElementById('startBtn').style.display = 'block';
    } else {
        initialize(options);
    }
}
