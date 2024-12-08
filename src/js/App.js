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

    options.texts
        ?.filter( t => t.event === 'songEnded' )
        ?.forEach( t => {
            audioManager.onEnded(() => {
                (new TitleManager({ text: t.text })).show();
            })
        } );

    audioManager.onEnded(() => {
        setTimeout(() => {
            document.body.dispatchEvent(new Event('musicEnded'));
        }, 5000);
    })
    await bpmManager.detectBPM(audioManager.audio.buffer)

    const instances = [];

    for( let i = 0; i < options.views.length; ++i ) {   
        const viewOption = options?.views?.[i] ?? {};
        const rootElement = createContainer({ viewHeight: viewOption.viewHeight, viewWidth: viewOption.viewWidth });
        document.getElementById('content').append(rootElement);
        const instance = new WebglManager({ rootElement, audioManager, bpmManager, options: {
            ...options,
            ...viewOption
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

    options.texts
        ?.filter( t => t.event !== 'songEnded' )
        ?.forEach( t => {
            const titleManager = new TitleManager({ ...t, position: t.position ?? 'top' });
            console.log(t.startTimer)
            titleManager.visibleAfter(t.startTimer ?? 0);
            if (t.endTimer) {
                titleManager.hideAfter(t.endTimer);
            }
        } );

    setTimeout(() => {
        initializeWebgls(options)
    }, options.songDelay ?? 0);
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
