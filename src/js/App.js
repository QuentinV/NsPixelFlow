import * as THREE from 'three'
import ReactiveParticlesManager from './managers/ReactiveParticlesManager'
import BPMManager from './managers/BPMManager'
import AudioManager from './managers/AudioManager'
import MeshManager from './managers/MeshManager'
import TitleManager from './managers/TitleManager'

const setBackground = ({ backgroundImage, backgroundColor }) => {
  const body = document.querySelector('body');
  if ( backgroundImage ) {
    body.style.background = `url('${backgroundImage}') center no-repeat cover`;
  }
  if ( backgroundColor ) {
    body.style.backgroundColor = backgroundColor;
  }
}

const setRenderer = options => {
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    })

    renderer.setClearColor(0x000000, 0)
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.autoClear = false
    document.querySelector('.content').appendChild(renderer.domElement)

    return renderer;
}

const getCamera = options => {
  const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 10000)
  camera.position.z = 12
  camera.frustumCulled = false
  return camera;
}

const resize = ({ camera, renderer }) => {
    const width = window.innerWidth
    const height = window.innerHeight

    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height)
}

const update = ({ particlesManager, audioManager, meshManager, renderer, scene, camera }) => {
    requestAnimationFrame(() => update({ particlesManager, meshManager, audioManager, renderer, scene, camera }))

    meshManager?.update()
    particlesManager?.update()
    audioManager.update()

    renderer.render(scene, camera)
}

const initializeWebgl = async (options) => {
    const renderer = setRenderer(options);
    const camera = getCamera(options);

    const scene = new THREE.Scene()
    scene.add(camera)

    const holder = new THREE.Object3D()
    holder.name = 'holder'
    scene.add(holder)
    holder.sortObjects = false

    const bpmManager = new BPMManager()
    const audioManager = new AudioManager(options)
    const meshManager = new MeshManager({ audioManager, options });
    const particlesManager = new ReactiveParticlesManager(audioManager, bpmManager, options)

    holder.add(particlesManager);

    await audioManager.loadAudioBuffer()
    
    if ( options.titleEnd ) {
      audioManager.onEnded(() => {
          (new TitleManager({ text: options.titleEnd })).show();
      })
    }

    bpmManager.addEventListener('beat', () => { 
        if (!audioManager.isPlaying) {
            return;
        }
        meshManager.onBPMBeat();
        particlesManager.onBPMBeat();
    })
    await bpmManager.detectBPM(audioManager.audio.buffer)

    particlesManager.init()
    await meshManager.init({ containerObject: particlesManager })
    await meshManager.nextMesh(options.shape);

    audioManager.play()

    update({ particlesManager, audioManager, meshManager, renderer, scene, camera });
    resize({ camera, renderer });

    if (options?.resize) {
        window.addEventListener('resize', () => resize({ camera, renderer }))
    }
}

export const setupApp = async options => {
    setBackground(options);
    if ( options?.title ) {
        const titleManager = new TitleManager({ text: options.title });
        titleManager.show();
        titleManager.hideAfter(options.titleHide);
    }

    setTimeout(() => {
      initializeWebgl(options)
    }, options.songDelay);
}
