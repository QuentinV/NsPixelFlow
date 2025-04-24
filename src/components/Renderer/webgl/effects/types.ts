import { WebGLRenderer } from '../index';
import * as THREE from 'three';

export interface EffectProps<T> {
    webgl: WebGLRenderer;
    containerObject: THREE.Object3D;
    settings?: T;
}

export abstract class BaseEffect<T> extends THREE.Object3D {
    props: EffectProps<T>;

    constructor(props: EffectProps<T>) {
        super();
        this.props = props;
    }

    settings() {
        return (this.props?.settings ?? {}) as T;
    }

    abstract update(): void;
}
