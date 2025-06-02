import { WebGLRenderer } from '../index';
import * as THREE from 'three';

export interface MeshProps<T> {
    webgl: WebGLRenderer;
    containerObject: THREE.Object3D;
    settings?: T;
}

export class BaseMesh<T> extends THREE.Object3D {
    props: MeshProps<T>;
    material;

    constructor(props: MeshProps<T>) {
        super();
        this.props = props;
        this.material = (props?.containerObject as any)?.getMaterial?.();
    }

    settings() {
        return (this.props?.settings ?? {}) as T;
    }
}
