import * as THREE from 'three';
import gsap from 'gsap';
import { BoxMeshSettings } from '../../../../api/projects';
import { BaseMesh, MeshProps } from './types';

export class CubeMesh extends BaseMesh<BoxMeshSettings> {
    constructor(props: MeshProps<BoxMeshSettings>) {
        super(props);
    }

    create() {
        const settings = this.settings();

        const widthSeg = Math.floor(
            THREE.MathUtils.randInt(
                settings.widthMin || 5,
                settings.widthMax || 20
            )
        );
        const heightSeg = Math.floor(
            THREE.MathUtils.randInt(
                settings.heightMin || 1,
                settings.heightMax || 40
            )
        );
        const depthSeg = Math.floor(
            THREE.MathUtils.randInt(
                settings.depthMin || 5,
                settings.depthMax || 80
            )
        );
        const geometry = new THREE.BoxGeometry(
            1,
            1,
            1,
            widthSeg,
            heightSeg,
            depthSeg
        );

        // Update shader material uniform for offset size with a random value
        this.material.uniforms.offsetSize.value = Math.floor(30); //THREE.MathUtils.randInt(30, 60))
        this.material.needsUpdate = true;

        // Create a container for the points mesh and set its orientation
        this.rotateX(Math.PI / 2);
        this.add(new THREE.Points(geometry, this.material));

        // Animate the rotation of the of the container
        const rOpts = {
            duration: settings.rotateDuration || 3,
            yoyo: !!settings.rotateYoyo,
            x: Math.random() * Math.PI,
            z: Math.random() * Math.PI * 2,
            ease: 'none',
            repeat: 1,
        };

        if (settings.keepRotate || settings.rotateYoyo) {
            rOpts.repeat = -1;
        }

        gsap.to(this.rotation, rOpts);

        return this;
    }

    initPosition() {
        const posZ = this.settings().posZ;
        gsap.to(this.props.containerObject.position, {
            duration: 0.6,
            z: posZ ? posZ * 1.3 : 10, //THREE.MathUtils.randInt(9, 11), // Random depth positioning within a range
            ease: 'elastic.out(0.8)',
        });
    }
}
