import * as THREE from 'three'
import { ExposionEffect } from '../effects/explosion';
import { MatrixEffect } from '../effects/matrix';
import { TornadoEffect } from '../effects/tornado';
import { VortexEffect } from '../effects/vortex';
import { FontLoader } from 'three/addons/loaders/FontLoader';

const effects = {
    explosion: ExposionEffect,
    matrix: MatrixEffect,
    tornado: TornadoEffect,
    vortex: VortexEffect
}

export default class TextMesh extends THREE.Object3D {
    constructor({ audioManager, containerObject, options }) {
        super();

        this.containerObject = containerObject;

        this.properties = {
            effect: options.effect || 'matrix',
            font: options.font || 'helvetiker_regular',
            text: options.text || 'Hello, Quentin!',
            debug: !!options.debug
        }

        this.position.z = -500;
        this.effect = null;
    }

    create() {
        return new Promise( res => {
            const loader = new FontLoader();
            loader.load(`https://threejs.org/examples/fonts/${this.properties.font}.typeface.json`, font => {
                const shapes = font.generateShapes(this.properties.text, 80);

                // Centering shapes
                const geometry = new THREE.ShapeGeometry(shapes);
                geometry.computeBoundingBox();
                const xMid = -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
                const yMid = -0.5 * (geometry.boundingBox.max.y - geometry.boundingBox.min.y);
                geometry.translate(xMid, yMid, 0);

                // Convert shapes to points with higher density, including holes
                const points = [];
                shapes.forEach(shape => {
                    const shapePoints = shape.getSpacedPoints(200);
                    shapePoints.forEach(point => {
                        points.push(new THREE.Vector3(point.x + xMid, point.y + yMid, 0));
                    });
                    shape.holes.forEach(hole => {
                        const holePoints = hole.getSpacedPoints(200);
                        holePoints.forEach(point => {
                            points.push(new THREE.Vector3(point.x + xMid, point.y + yMid, 0));
                        });
                    });
                });

                // Visualize initial points to debug
                if ( this.properties.debug ) {
                    const debugMaterial = new THREE.PointsMaterial({ color: 0xff0000, size: 5 });
                    const debugGeometry = new THREE.BufferGeometry().setFromPoints(points);
                    const debugPoints = new THREE.Points(debugGeometry, debugMaterial);
                    this.add(debugPoints);
                }

                this.effect = new effects[this.properties.effect]({ points });
                this.add(this.effect.init());

                res(this);
            });
        });
    }

    initPosition() {
        //
    }

    animate() {
        this.effect.animate();
    }
}