import { createEffect } from 'effector';
import * as THREE from 'three';
import { BPMManager, bpmManager } from './bpm';

export default class WebGLRenderer {
    rootElement?: HTMLElement;
    renderer?: THREE.WebGLRenderer;
    camera?: THREE.PerspectiveCamera;
    scene?: THREE.Scene;
    holder?: THREE.Object3D;

    bpmManager: BPMManager;

    constructor({ bpmManager }: { bpmManager: BPMManager }) {
        this.bpmManager = bpmManager;
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

    update() {
        if (this.renderer && this.scene && this.camera)
            this.renderer.render(this.scene, this.camera);
        //this.meshManager?.update();
        //this.particlesManager?.update();
    }

    getRootElement() {
        return this.rootElement;
    }
}

export const rendererManager = new WebGLRenderer({ bpmManager });

export const initRendererManager = createEffect(
    ({ element }: { element: HTMLElement }) => rendererManager.init(element)
);
