import * as THREE from 'three'
import MeshManager from './MeshManager';
import ReactiveParticlesManager from './ReactiveParticlesManager';

export default class WebGLRenderer {
    constructor({ rootElement, options, audioManager, bpmManager }) {
        this.rootElement = rootElement;
        this.options = options;
        this.audioManager = audioManager;
        this.bpmManager = bpmManager;
        console.log('webgl contructor', rootElement, this.options);
    }

    async init() {
        this.renderer = this._getRenderer();
        this.camera = this._getCamera();

        this.scene = new THREE.Scene()
        this.scene.add(this.camera)

        this.holder = new THREE.Object3D()
        this.holder.name = 'holder'
        this.scene.add(this.holder)
        this.holder.sortObjects = false

        this.meshManager = new MeshManager({ audioManager: this.audioManager, options: this.options });
        this.particlesManager = new ReactiveParticlesManager(this.audioManager, this.bpmManager, this.options)

        this.holder.add(this.particlesManager);

        this.bpmManager.addEventListener('beat', () => { 
            if (!this.audioManager.isPlaying) {
                return;
            }
            this.meshManager.onBPMBeat();
            this.particlesManager.onBPMBeat();
        })

        this.particlesManager.init()
        await this.meshManager.init({ containerObject: this.particlesManager })

        return { holder: this.holder, renderer: this.renderer, camera: this.camera };
    }

    _getRenderer() {
        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
        })

        renderer.setClearColor(0x000000, 0)
        renderer.setSize(this.rootElement.clientWidth, this.rootElement.clientHeight)
        renderer.autoClear = false
        this.rootElement.appendChild(renderer.domElement)

        return renderer;
    }

    _getCamera() {
        const camera = new THREE.PerspectiveCamera(70, this.rootElement.clientWidth / this.rootElement.clientHeight, 0.1, 10000)
        camera.position.z = 12
        camera.frustumCulled = false
        return camera;
    }

    resize() {
        const width = this.rootElement.clientWidth
        const height = this.rootElement.clientHeight
    
        this.camera.aspect = width / height
        this.camera.updateProjectionMatrix()
        this.renderer.setSize(width, height)
    }

    update() {    
        this.meshManager?.update()
        this.particlesManager?.update()
        this.renderer.render(this.scene, this.camera)
    }
}