import BPMManager from './managers/BPMManager'
import AudioManager from './managers/AudioManager'
import TitleManager from './managers/TitleManager'
import WebglManager from './managers/WebglManager'

const createContainer = ({ viewWidth, viewHeight }) => {
    const div = document.createElement('div');
    div.style.width = viewWidth || '100%';
    div.style.height = viewHeight || '100%';
    div.style.margin = 'auto';
    div.style.display = 'inline-block';
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
    audioManager.setStartTime(musicStartTime);
    console.log('music started after', musicStartTime);
    document.body.dispatchEvent(new CustomEvent('musicStarted', { detail: { musicStartTime } }))

    update({ audioManager, instances });

    if ( instances.length ) {
        document.querySelector('#recordBtn').addEventListener('click', () => {
            instances[0].record({ duration: 60, fps: 30 }); // FIXME audioManager.audio.duration
        });
    }

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