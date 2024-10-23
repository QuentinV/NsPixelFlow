import * as THREE from 'three'
import gsap from 'gsap'

export default class CubeMesh extends THREE.Object3D {
    constructor({ audioManager, containerObject, options }) {
        super()
        this.containerObject = containerObject;
        this.material = containerObject.getMaterial();

        this.properties = {
            keepRotate: options.keepRotate,
            rotateDuration: options.rotateDuration,
            rotateYoyo: options.rotateYoyo,
            widthMin: options.w || options.wMin,
            widthMax: options.w || options.wMax,
            heightMin: options.h || options.hMin,
            heightMax: options.h || options.hMax,
            depthMin: options.d || options.dMin,
            depthMax: options.d || options.dMax,
        }
    }
    
    create() {
        const widthSeg = Math.floor(THREE.MathUtils.randInt(this.properties.widthMin || 5, this.properties.widthMax || 20))
        const heightSeg = Math.floor(THREE.MathUtils.randInt(this.properties.heightMin || 1, this.properties.heightMax || 40))
        const depthSeg = Math.floor(THREE.MathUtils.randInt(this.properties.depthMin || 5, this.properties.depthMax || 80))
        const geometry = new THREE.BoxGeometry(1, 1, 1, widthSeg, heightSeg, depthSeg)

        // Update shader material uniform for offset size with a random value
        this.material.uniforms.offsetSize.value = Math.floor(30)//THREE.MathUtils.randInt(30, 60))
        this.material.needsUpdate = true

        // Create a container for the points mesh and set its orientation
        //const pointsMesh = new THREE.Object3D()
        this.rotateX(Math.PI / 2)
        this.add(new THREE.Points(geometry, this.material))

        // Animate the rotation of the of the container
        const rOpts = {
            duration: this.properties.rotateDuration || 3,
            yoyo: this.properties.rotateYoyo,
            x: Math.random() * Math.PI,
            z: Math.random() * Math.PI * 2,
            ease: 'none'
        };
        if ( this.properties.keepRotate || this.properties.rotateYoyo ) {
            rOpts.repeat = -1;
        }
        gsap.to(this.rotation, rOpts)

        return this;
    }

    initPosition() {
        gsap.to(this.containerObject.position, {
            duration: 0.6,
            z: 10, //THREE.MathUtils.randInt(9, 11), // Random depth positioning within a range
            ease: 'elastic.out(0.8)', // Elastic ease-out for a bouncy effect
        })
    }
}