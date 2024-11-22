import CubeMesh from "../meshes/CubeMesh";
import CylinderMesh from "../meshes/CylinderMesh";
import DrawingMesh from "../meshes/DrawingMesh";
import TextMesh from "../meshes/TextMesh";
import { ExposionEffect } from '../effects/explosion';
import { MatrixEffect } from '../effects/matrix';
import { TornadoEffect } from '../effects/tornado';
import { VortexEffect } from '../effects/vortex';
import { MorphingEffect } from '../effects/morphing';
import { BorderEffect } from "../effects/border";

const meshes = {
    drawing: () => DrawingMesh,
    box: () => CubeMesh,
    cylinder: () => CylinderMesh,
    random: () => Math.random() < 0.5 ? CubeMesh : CylinderMesh,
    text: () => TextMesh,
    'default': () => CubeMesh
}

const effects = {
    morphing: MorphingEffect,
    explosion: ExposionEffect,
    matrix: MatrixEffect,
    tornado: TornadoEffect,
    vortex: VortexEffect,
    border: BorderEffect
}

export default class MeshManager {
    constructor({ audioManager, options, width, height }) {
        this.audioManager = audioManager;
        this.properties = {
            ...options
        };

        this.properties.shape = options?.shape ?? 'random';

        this.properties = {
            ...this.properties,
            imageUrl: options.imageUrl,
            imagesSyncUrl: options.imagesSyncUrl,
            drawings: options.drawings,
            autoMix: (options.autoMix ?? true) || this.properties.shape === 'random',
            autoRotate: options.autoRotate ?? true,
            autoNext: options.autoNext ?? false,
            timerNext: 2000,
            keepRotate: options.keepRotate,
            rotateDuration: options.rotateDuration,
            effect: options.effect,
            animator: options.animator,
            width,
            height
        }

        this.effect = null;
    }

    async init({ containerObject }) {
        this.containerObject = containerObject;
        this.holderObjects = this.containerObject.getHolderObjects();

        this.properties.k = 0;
        this.objects = [null, null];

        if ( this.properties.imageUrl ) {
            this.properties.drawings = [ await (await fetch(this.properties.imageUrl)).json() ];
            await this.nextMesh('drawing');
        } else if ( this.properties.imagesSyncUrl ) {
            this.imagesSync = await this.loadImagesSync({ url: this.properties.imagesSyncUrl });
        } else {
            await this.nextMesh(this.properties.shape);
        }
    }

    onBPMBeat() {
        if (this.properties.autoMix && Math.random() < 0.1) {
            this.nextMesh(this.properties.shape);
        }

        if ( this.properties.autoNext && !this.properties.imagesSyncUrl ) {
            setTimeout(() => this.nextMesh(this.properties.shape), this.properties.timerNext );
        }        
    }

    async loadImagesSync({ url }) {
        const host = url.substring(0, url.lastIndexOf('/') + 1);
        const images = await (await fetch(url)).json();

        this.properties.drawings = [];
        const promises = images.map( v => fetch(host + v.url).then( res => res.json()));
        this.properties.drawings = await Promise.all(promises);

        let index = 0;
        let loading = false;

        setInterval(() => {
            if (loading || !this.audioManager.isPlaying || index >= images.length) return;
            const currentTime = this.audioManager.audio.context.currentTime;
            if ( currentTime >= images[index].start + 0.5 ) {
                this.nextMesh('drawing');
                index++;
            }
        }, 20);
    }

    async nextMesh(shape) {
        this.holderObjects.clear();

        let MeshCla = meshes[shape]?.();
        if ( !MeshCla ) MeshCla = meshes.default?.();

        let mesh = new MeshCla({ audioManager: this.audioManager, containerObject: this.containerObject, options: this.properties });
        await mesh.create(this.properties.k);

        let effect = null;
        if ( this.properties.effect ) {
            effect = new effects[this.properties.effect]({ 
                points: mesh.getPoints(), 
                width: this.properties.width, 
                height: this.properties.height, 
                containerObject: this.containerObject,
                animator: this.properties.animator
            });
        }

        if ( effect?.getType() === 'preload' ) {
            mesh.add(effect.init());
        } else if ( mesh.append ) {
            mesh.append();
        }

        if ( effect?.getType() === 'transition' ) {
            if ( this.properties.k > 0 ) {
                const nextContours = mesh.getContours();

                let oldMesh = new MeshCla({ audioManager: this.audioManager, containerObject: this.containerObject, options: this.properties });
                await oldMesh.create(this.properties.k - 1, nextContours);

                this.objects[0] = oldMesh;
                this.objects[1] = mesh;
                mesh = this.objects[0];
            } else {
                this.objects[0] = mesh;
            }  

            this.properties.k++;
        } else {
            this.objects[0] = mesh;
        }
        
        mesh?.initPosition();

        this.holderObjects.add(mesh); 

        this.effect = effect;
    }

    update() {
        if ( this.effect && !this.effectTimeout ) {
            this.effectTimeout = setTimeout(() => {
                this.effect.animate();
                if ( this.effect.isDone() ) {
                    console.log('effect done')
                    if ( this.objects[1] ) {
                        this.holderObjects?.clear();
                        this.objects[0] = this.objects[1];
                        this.objects[1] = null;
                        this.holderObjects.add(this.objects[0]);
                    }
                    this.effect = null;
                }
                this.effectTimeout = null;
            }, 24);
        }
    }    
}