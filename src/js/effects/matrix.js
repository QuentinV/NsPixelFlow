
import { BaseEffect} from './baseEffect';
import * as THREE from 'three'

export class MatrixEffect extends BaseEffect {
    constructor({ options, points, vertexColors, fadeOutTimer, containerObject }) {
        super({ options, points, vertexColors, fadeOutTimer, containerObject });
    }
    
    init() {
        this.particleGeometry = new THREE.BufferGeometry();
        const vertices = new Float32Array(this.points.length * 3);
        const initialPositions = [];
        for (let i = 0; i < this.points.length; i++) {
            // Calculate falling start positions
            const startX = this.points[i].x;
            const startY = Math.random() * 2000; // Start positions above the screen
            const startZ = this.points[i].z;
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