import { BaseEffect } from "./baseEffect";
import * as THREE from 'three'

export class BorderEffect extends BaseEffect {
    constructor({ options, points, vertexColors, fadeOutTimer, containerObject }) {
        super({ options, points, vertexColors, fadeOutTimer, containerObject });
        this.width = options.width;
        this.height = options.height;
    }

    getType() {
        return 'preload';
    }

    init() {
        this.particleGeometry = new THREE.BufferGeometry();
        const vertices = new Float32Array(this.points.length * 3);
        console.log('init', this.width, this.height)
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
            vertices[i * 3 + 2] = (Math.random() - 0.5) * (this.width > 1500 ? 600 : 1050); // Random depth
        }

        this.particleGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        if ( this.vertexColors ) {
            this.particleGeometry.setAttribute('a_color', this.vertexColors);
        }

        return new THREE.Points(this.particleGeometry, this.material);
    }
}