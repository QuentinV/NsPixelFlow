import * as THREE from 'three';
import { RenderSettings } from '../../../api/projects';
import { AudioManager, audioManager } from '../../../state/audio';

export class WebGLRenderer {
    rootElement?: HTMLElement;
    renderer?: THREE.WebGLRenderer;
    camera?: THREE.PerspectiveCamera;
    scene?: THREE.Scene;
    holder?: THREE.Object3D;

    audioManager: AudioManager;

    constructor({ audioManager }: { audioManager: AudioManager }) {
        this.audioManager = audioManager;
    }

    init(rootElement: HTMLElement) {
        this.rootElement = rootElement;
        this.renderer = this.#initRenderer();
        this.camera = this.#initCamera();

        this.scene = new THREE.Scene();
        this.scene.add(this.camera);

        this.holder = new THREE.Object3D();
        this.holder.name = 'holder';
        this.scene.add(this.holder);
        (this.holder as any).sortObjects = false;

        return {
            holder: this.holder,
            renderer: this.renderer,
            camera: this.camera,
        };
    }

    #initRenderer() {
        const rootElement = this.rootElement!;
        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
        });

        renderer.setClearColor(0x000000, 0);
        renderer.setSize(rootElement.clientWidth, rootElement.clientHeight);
        renderer.autoClear = false;
        rootElement.appendChild(renderer.domElement);

        return renderer;
    }

    #initCamera() {
        const rootElement = this.rootElement!;

        const camera = new THREE.PerspectiveCamera(
            70,
            rootElement.clientWidth / rootElement.clientHeight,
            0.1,
            10000
        );
        camera.position.z = 12;
        camera.frustumCulled = false;

        return camera;
    }

    resize() {
        const width = this.rootElement!.clientWidth;
        const height = this.rootElement!.clientHeight;

        this.camera!.aspect = width / height;
        this.camera!.updateProjectionMatrix();
        this.renderer!.setSize(width, height);
    }

    updateState(settings: RenderSettings) {}

    update() {
        if (this.renderer && this.scene && this.camera)
            this.renderer.render(this.scene, this.camera);
        //this.meshManager?.update();
        //this.particlesManager?.update();
    }

    getRootElement() {
        return this.rootElement;
    }

    getAudioManager() {
        return this.audioManager;
    }
}

export const rendererManager = new WebGLRenderer({ audioManager });
