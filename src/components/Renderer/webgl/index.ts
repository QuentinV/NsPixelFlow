import * as THREE from 'three';
import { RenderSettings } from '../../../api/projects';
import { AudioManager, audioManager } from '../../../state/audio';
import { MeshManager } from './managers/MeshManager';

class BasicHolder extends THREE.Object3D {
    material: THREE.ShaderMaterial;
    constructor() {
        super();
        this.name = 'holder';
        (this as any).sortObjects = false;
        this.material = new THREE.ShaderMaterial({
            side: THREE.DoubleSide,
            transparent: false,
            uniforms: {
                offsetSize: { value: 2 },
            },
        });
    }
    getMaterial() {
        return this.material;
    }
}

export class WebGLRenderer {
    rootElement?: HTMLElement;
    renderer?: THREE.WebGLRenderer;
    camera?: THREE.PerspectiveCamera;
    scene?: THREE.Scene;
    holder?: THREE.Object3D;

    audioManager: AudioManager;
    meshManager?: MeshManager;

    playing: boolean;
    recording: boolean;

    frames?: string[];

    constructor({ audioManager }: { audioManager: AudioManager }) {
        this.audioManager = audioManager;
        this.playing = false;
        this.recording = false;
    }

    init(rootElement: HTMLElement) {
        this.rootElement = rootElement;
        this.renderer = this.#initRenderer();
        this.camera = this.#initCamera();

        this.scene = new THREE.Scene();
        this.scene.add(this.camera);

        this.holder = new BasicHolder();
        this.scene.add(this.holder);

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
        camera.position.z = 1;
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

    async updateState(settings: RenderSettings) {
        this.holder?.clear();

        if (!settings.components) return;

        this.meshManager = new MeshManager({
            meshes: settings.components,
            webgl: this,
        });

        await this.meshManager.nextMesh();

        this.resize();
        console.log('webgl state updated');
    }

    play() {
        this.playing = true;
        this.triggerUpdate();
    }

    pause() {
        this.playing = false;
    }

    triggerUpdate() {
        if (!this.playing) {
            return;
        }

        requestAnimationFrame(() => {
            this.audioManager.update();
            this.meshManager?.update();
            this.renderer!.render(this.scene!, this.camera!);

            if (this.recording) {
                const url = this.renderer!.domElement.toDataURL();
                this.frames?.push(url);
            }

            this.triggerUpdate();
        });
    }

    record(time: number): Promise<string[]> {
        this.recording = true;
        this.frames = [];
        return new Promise((res, rej) => {
            setTimeout(() => {
                this.recording = false;
                const frames = this.frames;
                this.frames = [];
                res(frames!);
            }, time * 1000);
        });
    }

    getRootElement() {
        return this.rootElement;
    }

    getAudioManager() {
        return this.audioManager;
    }
}

export const rendererManager = new WebGLRenderer({ audioManager });
