import * as THREE from 'three'
import { BaseEffect } from './baseEffect';

export class ExposionEffect extends BaseEffect {
    constructor({ points }) {
        super();
        this.points = points;
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

        const particleMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 2 });
        const particleSystem = new THREE.Points(this.particleGeometry, particleMaterial);
        
        return particleSystem;
    }
}