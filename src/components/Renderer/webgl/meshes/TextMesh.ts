import * as THREE from 'three';
import { BaseMesh, MeshProps } from './types';
import { TextMeshSettings } from '../../../../api/projects';

// import { FontLoader } from 'three/addons/loaders/FontLoader.js';
declare const FontLoader: any;

export class TextMesh extends BaseMesh<TextMeshSettings> {
    opts: TextMeshSettings;
    points?: THREE.Vector3[];

    constructor(props: MeshProps<TextMeshSettings>) {
        super(props);

        const settings = this.settings();
        this.opts = {
            font: settings.font || 'helvetiker_regular',
            text: settings.text || 'Hello, Quentin!',
        };

        this.position.z = -500;
    }

    create() {
        return new Promise((res) => {
            const loader = new FontLoader();
            loader.load(
                `https://threejs.org/examples/fonts/${this.opts.font}.typeface.json`,
                (font: any) => {
                    const shapes = font.generateShapes(this.opts.text, 80);

                    // Centering shapes
                    const geometry = new THREE.ShapeGeometry(shapes);
                    geometry.computeBoundingBox();
                    const boundingBox = geometry.boundingBox!;

                    const xMid = -0.5 * (boundingBox.max.x - boundingBox.min.x);
                    const yMid = -0.5 * (boundingBox.max.y - boundingBox.min.y);
                    geometry.translate(xMid, yMid, 0);

                    // Convert shapes to points with higher density, including holes
                    const points: THREE.Vector3[] = [];
                    shapes.forEach((shape: any) => {
                        const shapePoints = shape.getSpacedPoints(200);
                        shapePoints.forEach(
                            (point: { x: number; y: number }) => {
                                points.push(
                                    new THREE.Vector3(
                                        point.x + xMid,
                                        point.y + yMid,
                                        0
                                    )
                                );
                            }
                        );
                        shape.holes.forEach((hole: any) => {
                            const holePoints = hole.getSpacedPoints(200);
                            holePoints.forEach(
                                (point: { x: number; y: number }) => {
                                    points.push(
                                        new THREE.Vector3(
                                            point.x + xMid,
                                            point.y + yMid,
                                            0
                                        )
                                    );
                                }
                            );
                        });
                    });
                    this.points = points;

                    // Visualize initial points to debug
                    if (this.settings().debug) {
                        const debugMaterial = new THREE.PointsMaterial({
                            color: 0xff0000,
                            size: 5,
                        });
                        const debugGeometry =
                            new THREE.BufferGeometry().setFromPoints(points);
                        const debugPoints = new THREE.Points(
                            debugGeometry,
                            debugMaterial
                        );
                        this.add(debugPoints);
                    }

                    res(this);
                }
            );
        });
    }

    getPoints() {
        return this.points;
    }

    initPosition() {
        //
    }
}
