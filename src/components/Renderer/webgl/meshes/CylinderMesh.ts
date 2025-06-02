import * as THREE from 'three';
import gsap from 'gsap';
import { BaseMesh, MeshProps } from './types';
import { CylinderMeshSettings } from '../../../../api/projects';

export class CylinderMesh extends BaseMesh<CylinderMeshSettings> {
    constructor(props: MeshProps<CylinderMeshSettings>) {
        super(props);
    }

    create() {
        const { radialMax, radialMin, heightMax, heightMin } = this.settings();
        const radialSeg = Math.floor(
            THREE.MathUtils.randInt(radialMin || 1, radialMax || 3)
        );
        const heightSeg = Math.floor(
            THREE.MathUtils.randInt(heightMin || 1, heightMax || 5)
        );
        const geometry = new THREE.CylinderGeometry(
            1,
            1,
            4,
            64 * radialSeg,
            64 * heightSeg,
            true
        );

        // Update shader material uniforms for offset and size with random and fixed values
        this.material.uniforms.offsetSize.value = Math.floor(
            THREE.MathUtils.randInt(30, 60)
        );
        this.material.uniforms.size.value = 2;
        this.material.needsUpdate = true;
        this.material.uniforms.needsUpdate = true;

        // Create a points mesh using the cylinder geometry and shader material
        const pointsMesh = new THREE.Points(geometry, this.material);
        pointsMesh.rotation.set(Math.PI / 2, 0, 0);

        this.add(pointsMesh);

        return this;
    }

    initPosition() {
        let rotY = 0;
        let posZ = this.settings().posZ;
        if (posZ === undefined) {
            if (Math.random() < 0.2) {
                rotY = Math.PI / 2;
                posZ = THREE.MathUtils.randInt(10, 11.5);
            } else {
                posZ = THREE.MathUtils.randInt(9, 11);
            }
        }

        gsap.to(
            (this.props.containerObject as any).getHolderObjects().rotation,
            {
                duration: 0.2,
                y: rotY,
                ease: 'elastic.out(0.2)',
            }
        );

        gsap.to(this.props.containerObject.position, {
            duration: 0.6,
            z: posZ,
            ease: 'elastic.out(0.8)',
        });
    }
}
