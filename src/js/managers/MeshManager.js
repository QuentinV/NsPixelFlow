import CubeMesh from "../meshes/CubeMesh";
import CylinderMesh from "../meshes/CylinderMesh";
import DrawingMesh from "../meshes/DrawingMesh";
import TextMesh from "../meshes/TextMesh";
import TriangleMesh from '../meshes/TriangleMesh';
import { ExposionEffect } from '../effects/explosion';
import { MatrixEffect } from '../effects/matrix';
import { TornadoEffect } from '../effects/tornado';
import { VortexEffect } from '../effects/vortex';
import { MorphingEffect } from '../effects/morphing';
import { BorderEffect } from "../effects/border";
import CustomMesh from "../meshes/CustomMesh";

const meshes = {
    drawing: () => DrawingMesh,
    box: () => CubeMesh,
    triangle: () => TriangleMesh,
    cylinder: () => CylinderMesh,
    custom: () => CustomMesh,
    random: () => { const r = Math.random(); return r < 0.33 ? CubeMesh : r < 0.66 ? CylinderMesh : TriangleMesh; },
    text: () => TextMesh,
    'default': () => CubeMesh
}

const effects = {
    morphing: () => MorphingEffect,
    explosion: () => ExposionEffect,
    matrix: () => MatrixEffect,
    tornado: () => TornadoEffect,
    vortex: () => VortexEffect,
    border: () => BorderEffect,
    random: () => effects[Object.keys(effects)[Math.floor(Math.random() * Object.keys(effects).length)]]()
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
            height,
            refreshTime: options.refreshTime ?? 24
        }
    }

    async init({ containerObject }) {
        this.containerObject = containerObject;
        this.holderObjects = this.containerObject.getHolderObjects();

        this.properties.k = 0;
        this.objects = [null, null];

        if ( this.properties.imageUrl ) {
            this.properties.drawings = [ await (await fetch(this.properties.imageUrl)).json() ];
            await this.nextMesh('drawing');
        } else if ( this.properties.images ) {
            await this.loadImagesSync(this.properties.images);
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

    async loadImagesSync({ host, list }) {
        //const host = url.substring(0, url.lastIndexOf('/') + 1);
        //const images = await (await fetch(url)).json();

        this.properties.drawings = [];
        const promises = list.map( ({ url }) => fetch(host + url).then( res => res.json()));
        this.properties.drawings = await Promise.all(promises);

        let index = 0;

        setInterval(() => {
            if (!this.audioManager.isPlaying || index >= list.length) return;
            const currentTime = this.audioManager.getCurrentTimeWithOffset();
            if ( currentTime >= list[index].start ) {
                console.log("next drawing")
                this.nextMesh('drawing', { ...this.properties, ...(list[index].opts ?? {}) });
                index++;
            }
        }, 20);
    }

    async nextMesh(shape, options) {
        if ( !options ) {
            options = this.properties;
        }
        this.holderObjects.clear();

        let MeshCla = meshes[shape]?.();
        if ( !MeshCla ) MeshCla = meshes.default?.();

        let mesh = new MeshCla({ audioManager: this.audioManager, containerObject: this.containerObject, options });
        await mesh.create(this.properties.k);

        let effect = null;
        if ( options.effect ) {
            effect = new (effects[options.effect]())({ 
                options,
                points: mesh.getPoints(),
                vertexColors: mesh.getVertexColors(),
                containerObject: this.containerObject
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

                let oldMesh = new MeshCla({ audioManager: this.audioManager, containerObject: this.containerObject, options });
                await oldMesh.create(this.properties.k - 1, nextContours);
                oldMesh.append();

                this.objects[0] = oldMesh;
                this.objects[1] = mesh;
                mesh = this.objects[0];
            } else {
                this.objects[0] = mesh;
            }
        } else {
            this.objects[0] = mesh;
        }

        this.properties.k++;
        
        mesh?.initPosition();

        this.holderObjects.add(mesh); 

        if ( effect && ( effect?.getType() !== 'transition' || this.objects[1] ) ) {
            this._startEffect(effect);
        }
    }

    _startEffect(effect) {
        console.log('starting effect at ', Date.now() - this.properties.perfCheck)
        const effectInterval = setInterval(() => {
            effect.animate();
            if ( effect.isDone() ) {
                clearInterval(effectInterval);
                console.log('effect done', Date.now() - this.properties.perfCheck)
                if ( this.objects[1] ) {
                    this.holderObjects?.clear();
                    this.objects[0] = this.objects[1];
                    this.objects[1] = null;
                    this.holderObjects.add(this.objects[0]);
                }
            }
        }, this.properties.refreshTime);
    }

    update() {
        //
    }    
}