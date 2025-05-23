import * as THREE from 'three'
import { BaseEffect } from './baseEffect';

export class TornadoEffect extends BaseEffect {
    constructor({ options, points, vertexColors, fadeOutTimer, containerObject }) {
        super({ options, points, vertexColors, fadeOutTimer, containerObject });
    }

    init() {
        // Create point cloud with BufferGeometry
        this.particleGeometry = new THREE.BufferGeometry();
        const vertices = new Float32Array(this.points.length * 3);
        const initialPositions = [];
        for (let i = 0; i < this.points.length; i++) {
            // Calculate tornado start positions
            const angle = i * 0.1;
            const radius = 300 + (i / this.points.length) * 200; // Varying radius to create a funnel shape
            const height = (i / this.points.length) * 2000; // Varying height
            const startX = radius * Math.cos(angle);
            const startY = height;
            const startZ = radius * Math.sin(angle);
            initialPositions.push(new THREE.Vector3(startX, startY, startZ));
            vertices[i * 3] = startX;
            vertices[i * 3 + 1] = startY;
            vertices[i * 3 + 2] = startZ;
        }
        
        this.particleGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        if ( this.vertexColors ) {
            this.particleGeometry.setAttribute('a_color', this.vertexColors);
        }

        const particleSystem = new THREE.Points(this.particleGeometry, this.material);
        
        return particleSystem;
    }
}