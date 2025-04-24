import * as THREE from 'three';
import { CubeMesh } from '../meshes/CubeMesh';
import { CylinderMesh } from '../meshes/CylinderMesh';
import { DrawingMesh } from '../meshes/DrawingMesh';
import { TextMesh } from '../meshes/TextMesh';
import { TriangleMesh } from '../meshes/TriangleMesh';
import { ExposionEffect } from '../transitions/explosion';
import { MatrixEffect } from '../transitions/matrix';
import { TornadoEffect } from '../transitions/tornado';
import { VortexEffect } from '../transitions/vortex';
import { MorphingEffect } from '../transitions/morphing';
import { BorderEffect } from '../transitions/border';
import { CustomMesh } from '../meshes/CustomMesh';
import { RenderComponent } from '../../../../api/projects';
import { WebGLRenderer } from '..';
import { ReactiveParticlesEffect } from '../effects/ReactiveParticlesEffect';
import { BaseEffect } from '../effects/types';

const meshes = {
    drawing: () => DrawingMesh,
    box: () => CubeMesh,
    triangle: () => TriangleMesh,
    cylinder: () => CylinderMesh,
    custom: () => CustomMesh,
    random: () => {
        const r = Math.random();
        return r < 0.33 ? CubeMesh : r < 0.66 ? CylinderMesh : TriangleMesh;
    },
    text: () => TextMesh,
    default: () => CubeMesh,
};

const transitions = {
    morphing: () => MorphingEffect,
    explosion: () => ExposionEffect,
    matrix: () => MatrixEffect,
    tornado: () => TornadoEffect,
    vortex: () => VortexEffect,
    border: () => BorderEffect,
    /*random: () =>
        effects[
            Object.keys(effects)[
                Math.floor(Math.random() * Object.keys(effects).length)
            ]
        ](),*/
};

const effects = {
    reactiveParticles: () => ReactiveParticlesEffect,
};

interface MeshManagerProps {
    webgl: WebGLRenderer;
    meshes: RenderComponent[];
}

export class MeshManager {
    props: MeshManagerProps;
    objects: [THREE.Object3D | null, THREE.Object3D | null];
    index: number;
    effect?: BaseEffect<unknown>;

    constructor(props: MeshManagerProps) {
        this.props = props;
        this.objects = [null, null];
        this.index = -1;

        // timerNext 2000
        // refreshTime 24
    }

    async init() {
        //this.holderObjects = this.containerObject.getHolderObjects();

        //this.properties.k = 0;
        this.objects = [null, null];

        /*if (this.properties.imageUrl) {
            this.properties.drawings = [
                await (await fetch(this.properties.imageUrl)).json(),
            ];
            await this.nextMesh('drawing');
        } else if (this.properties.images) {
            await this.loadImagesSync(this.properties.images);
        } else {
            await this.nextMesh(this.properties.shape);
        }*/
    }

    /*
    onBPMBeat() {
        if (this.properties.autoMix && Math.random() < 0.1) {
            this.nextMesh(this.properties.shape);
        }

        if (this.properties.autoNext && !this.properties.imagesSyncUrl) {
            setTimeout(
                () => this.nextMesh(this.properties.shape),
                this.properties.timerNext
            );
        }
    }*/

    /*
    async loadImagesSync({ host, list, range }) {
        if (!list) list = [];
        this.properties.drawings = [];
        if (range) {
            const interval = range?.interval ?? 10;
            const random = [];
            const min = range.min ?? 0;
            const max = range.max ?? 0;
            let count =
                range.count ??
                Math.floor(this.audioManager.audio.buffer.duration / interval);
            if (count > max) count = max;
            console.log('Loading ', count, ' pictures');
            for (let i = min; i < count; ++i) {
                let n = Math.floor(Math.random() * (max - min + 1)) + min;
                random.push(n);
            }
            list = random.map((k, i) => ({
                ...(list[i] ?? {}),
                url: `${k}.json`,
                start: interval * i,
            }));
        }

        const promises = list.map(({ url }) =>
            fetch(host + url).then((res) => res.json())
        );
        this.properties.drawings = await Promise.all(promises);

        let index = 0;

        setInterval(() => {
            if (!this.audioManager.isPlaying || index >= list.length) return;
            const currentTime = this.audioManager.getCurrentTimeWithOffset();
            if (currentTime >= list[index].start) {
                console.log('next drawing');
                this.nextMesh('drawing', {
                    ...this.properties,
                    ...(list[index].opts ?? {}),
                });
                index++;
            }
        }, 20);
    }*/

    async nextMesh() {
        this.props.webgl.holder?.clear();
        const componentDef = this.props.meshes[++this.index];

        let MeshCla = meshes[componentDef.type ?? 'box']?.();
        if (!MeshCla) MeshCla = meshes.default?.();

        let effect: any = null;
        if (componentDef.effects?.length && componentDef.effects?.[0].type) {
            const EffectCla = effects[componentDef.effects[0].type]();
            effect = new EffectCla({
                webgl: this.props.webgl,
                settings: componentDef.effects[0].settings,
                containerObject: this.props.webgl.holder!,
            });
        }
        this.effect = effect;

        const container = effect ?? this.props.webgl.holder;
        const holder = container?.getHolderObjects?.() ?? container;

        let mesh = new MeshCla({
            webgl: this.props.webgl,
            containerObject: container,
            settings: componentDef.settings as any, // FIXME remove any
        });
        await mesh.create();

        mesh.initPosition();
        holder.add(mesh);

        /*let effect = null;
        if (options.effect) {
            effect = new (effects[options.effect]())({
                options,
                points: mesh.getPoints(),
                vertexColors: mesh.getVertexColors(),
                containerObject: this.containerObject,
            });
        }

        if (effect?.getType() === 'preload') {
            mesh.add(effect.init());
        } else if (mesh.append) {
            mesh.append();
        }*/

        /*
        if (effect?.getType() === 'transition') {
            if (this.properties.k > 0) {
                const nextContours = mesh.getContours();

                let oldMesh = new MeshCla({
                    audioManager: this.audioManager,
                    containerObject: this.containerObject,
                    options,
                });
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

        if (effect && (effect?.getType() !== 'transition' || this.objects[1])) {
            this._startEffect(effect);
        }*/
    }

    /*
    _startEffect(effect) {
        console.log(
            'starting effect at ',
            Date.now() - this.properties.perfCheck
        );
        const effectInterval = setInterval(() => {
            effect.animate();
            if (effect.isDone()) {
                clearInterval(effectInterval);
                console.log(
                    'effect done',
                    Date.now() - this.properties.perfCheck
                );
                if (this.objects[1]) {
                    this.holderObjects?.clear();
                    this.objects[0] = this.objects[1];
                    this.objects[1] = null;
                    this.holderObjects.add(this.objects[0]);
                }
            }
        }, this.properties.refreshTime);
    }*/

    update() {
        this.effect?.update();
    }
}
