import * as THREE from 'three'
import { BaseEffect } from './baseEffect';

export class VortexEffect extends BaseEffect {
    constructor({ points, fadeOutTimer, containerObject }) {
        super({ points, fadeOutTimer, containerObject });
    }
    
    init() {
        this.particleGeometry = new THREE.BufferGeometry();
        const vertices = new Float32Array(this.points.length * 3);
        const initialPositions = [];
        for (let i = 0; i < this.points.length; i++) {
            // Calculate wave start positions
            const startX = this.points[i].x + Math.sin(i * 0.1) * 100;
            const startY = this.points[i].y + Math.cos(i * 0.1) * 100;
            const startZ = this.points[i].z + Math.sin(i * 0.1) * 50;
            initialPositions.push(new THREE.Vector3(startX, startY, startZ));
            vertices[i * 3] = startX;
            vertices[i * 3 + 1] = startY;
            vertices[i * 3 + 2] = startZ;
        }
        this.particleGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

        this.particleMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 5, transparent: true, opacity: 1 });
        
        return new THREE.Points(this.particleGeometry, this.material);;
    }
}