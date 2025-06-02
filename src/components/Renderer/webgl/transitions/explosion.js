import * as THREE from 'three'
import { BaseEffect } from './baseEffect';

export class ExposionEffect extends BaseEffect {
    constructor({ options, points, vertexColors, fadeOutTimer, containerObject }) {
        super({ options, points, vertexColors, fadeOutTimer, containerObject });
    }

    init() {
        this.particleGeometry = new THREE.BufferGeometry();
        const vertices = new Float32Array(this.points.length * 3);
        for (let i = 0; i < this.points.length; i++) {
            vertices[i * 3] = (Math.random() - 0.5) * window.innerWidth;
            vertices[i * 3 + 1] = (Math.random() - 0.5) * window.innerHeight;
            vertices[i * 3 + 2] = (Math.random() - 0.5) * 2000;
        }
        this.particleGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        if ( this.vertexColors ) {
            this.particleGeometry.setAttribute('a_color', this.vertexColors);
        }
        return new THREE.Points(this.particleGeometry, this.material);
    }
}