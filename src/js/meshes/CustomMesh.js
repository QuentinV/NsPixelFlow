import * as THREE from 'three'
import gsap from 'gsap'

export default class CustomMesh extends THREE.Object3D {
    constructor({ audioManager, containerObject, options }) {
        super()
        this.containerObject = containerObject;
        this.material = containerObject.getMaterial();

        this.properties = {
            posZ: options.posZ,
            keepRotate: options.keepRotate,
            rotateDuration: options.rotateDuration,
            segments: options.segments // [ { x, y, z, w, h, d } ]
        }
    }
    
    create() {        
        const obj = new THREE.Object3D();
        obj.position.y = -7;

        const widthSeg = Math.floor(THREE.MathUtils.randInt(60, 80))
        const heightSeg = Math.floor(THREE.MathUtils.randInt(5, 20))
        const depthSeg = Math.floor(THREE.MathUtils.randInt(5, 20))

        this.properties.segments.forEach( ({ x, y, z, w, h, d, rotate }) => {
            const rect = new THREE.Points(new THREE.BoxGeometry(w, h, d, widthSeg, heightSeg, depthSeg), this.material);
            rect.position.set(x ?? 0, y ?? 0, z ?? 0);
            if ( rotate ) {
                rect.rotation.set(rotate.x ?? 0, rotate.y ?? 0, rotate.z ?? 0);
            }
            obj.add(rect);
        });
        
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