import * as THREE from 'three'
import gsap from 'gsap'

export default class CylinderMesh extends THREE.Object3D {
    constructor({ audioManager, containerObject, options }) {
        super()
        this.material = containerObject.getMaterial();
        this.containerObject = containerObject;

        this.properties = {
            posZ: options.posZ,
            heightMin: options.h || options.hMin,
            heightMax: options.h || options.hMax,
            radialMin: options.r || options.rMin,
            radialMax: options.r || options.rMax
        }
    }

    create() {
        const radialSeg = Math.floor(THREE.MathUtils.randInt(this.properties.radialMin || 1, this.properties.radialMax || 3))
        const heightSeg = Math.floor(THREE.MathUtils.randInt(this.properties.heightMin || 1, this.properties.heightMax || 5))
        const geometry = new THREE.CylinderGeometry(1, 1, 4, 64 * radialSeg, 64 * heightSeg, true)

        // Update shader material uniforms for offset and size with random and fixed values
        this.material.uniforms.offsetSize.value = Math.floor(THREE.MathUtils.randInt(30, 60))
        this.material.uniforms.size.value = 2
        this.material.needsUpdate = true
        this.material.uniforms.needsUpdate = true

        // Create a points mesh using the cylinder geometry and shader material
        const pointsMesh = new THREE.Points(geometry, this.material)
        pointsMesh.rotation.set(Math.PI / 2, 0, 0)

        this.add(pointsMesh);

        return this;
    }

    initPosition() {
        let rotY = 0
        let posZ;
        if ( this.properties.posZ ) {
            posZ = this.properties.posZ;
        } else if (Math.random() < 0.2) {
            rotY = Math.PI / 2
            posZ = THREE.MathUtils.randInt(10, 11.5)
        } else {
            posZ = THREE.MathUtils.randInt(9, 11)
        }

        gsap.to(this.containerObject.getHolderObjects().rotation, {
            duration: 0.2,
            y: rotY,
            ease: 'elastic.out(0.2)',
        })

        gsap.to(this.containerObject.position, {
            duration: 0.6,
            z: posZ,
            ease: 'elastic.out(0.8)',
        })
    }
}