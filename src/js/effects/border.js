import { BaseEffect } from "./baseEffect";
import * as THREE from 'three'

export class BorderEffect extends BaseEffect {
    constructor({ points, fadeOutTimer, containerObject, animator, height, width }) {
        super({ points, fadeOutTimer, containerObject, animator });
        this.width = width;
        this.height = height;
    }

    getType() {
        return 'preload';
    }

    init() {
        this.particleGeometry = new THREE.BufferGeometry();
        const vertices = new Float32Array(this.points.length * 3);

        for (let i = 0; i < this.points.length; i++) {
            const side = Math.floor(Math.random() * 4);
            
            switch (side) {
                case 0: // top
                    vertices[i * 3] = (Math.random() - 0.5) * this.width;
                    vertices[i * 3 + 1] = this.height / 2;
                    break;
                case 1: // right
                    vertices[i * 3] = this.width / 2;
                    vertices[i * 3 + 1] = (Math.random() - 0.5) * this.height;
                    break;
                case 2: // bottom
                    vertices[i * 3] = (Math.random() - 0.5) * this.width;
                    vertices[i * 3 + 1] = -this.height / 2;
                    break;
                case 3: // left
                    vertices[i * 3] = -this.width / 2;
                    vertices[i * 3 + 1] = (Math.random() - 0.5) * this.height;
                    break;
            }
            vertices[i * 3 + 2] = (Math.random() - 0.5) * 2000; // Random depth
        }

        this.particleGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        return new THREE.Points(this.particleGeometry, this.material);
    }
}