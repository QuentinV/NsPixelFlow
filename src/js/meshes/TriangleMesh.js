import * as THREE from 'three'
import gsap from 'gsap'

export default class TriangleMesh extends THREE.Object3D {
    constructor({ audioManager, containerObject, options }) {
        super()
        this.containerObject = containerObject;
        this.material = containerObject.getMaterial();

        this.properties = {
            posZ: options.posZ,
            keepRotate: options.keepRotate,
            rotateDuration: options.rotateDuration
        }
    }
    
    create() {        
        const obj = new THREE.Object3D();
        obj.position.y = -7;

        const widthSeg = Math.floor(THREE.MathUtils.randInt(60, 80))
        const heightSeg = Math.floor(THREE.MathUtils.randInt(5, 20))
        const depthSeg = Math.floor(THREE.MathUtils.randInt(5, 20))

        // Create three overlapping rectangular shapes
        const rectangle1 = new THREE.Points(new THREE.BoxGeometry(7, 1, 1, widthSeg, heightSeg, depthSeg), this.material);
        const rectangle2 = new THREE.Points(new THREE.BoxGeometry(7, 1, 1, widthSeg, heightSeg, depthSeg), this.material);
        const rectangle3 = new THREE.Points(new THREE.BoxGeometry(7, 1, 1, widthSeg, heightSeg, depthSeg), this.material);

        // Position the rectangles to form a triangular shape
        rectangle1.position.set(0, 0, -2.8);
        rectangle2.position.set(1.5, 0, 0);
        rectangle2.rotation.y = Math.PI / 3;
        rectangle3.position.set(-1.5, 0, 0);
        rectangle3.rotation.y = -Math.PI / 3;

        // Add rectangles to the scene
        obj.add(rectangle1);
        obj.add(rectangle2);
        obj.add(rectangle3);
        
        // Update shader material uniform for offset size with a random value
        this.material.uniforms.offsetSize.value = 30;
        this.material.needsUpdate = true;

        // Create a container for the points mesh and set its orientation
        this.rotateX(Math.PI / 2);
        this.add(obj);

        return this;
    }

    initPosition() {
        gsap.to(this.containerObject.position, {
            duration: 0.6,
            z: this.properties.posZ ?? 9,
            ease: 'elastic.out(0.8)'
        })
    }
}