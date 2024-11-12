import * as THREE from 'three'

export class BaseEffect {
    constructor({ points, fadeOutTimer }) {
        this.points = points;
        if ( fadeOutTimer ) {
            setTimeout(() => {
                this.fadeOutAnimate = true;
            }, fadeOutTimer);
        }
    }

    getParticleGeometry() {
        return this.particleGeometry;
    }

    getParticleMaterial() {
        return this.particleMaterial;
    }
    
    getPoints() {
        return this.points;
    }

    animate() {
        const points = this.getPoints();
        const positions = this.getParticleGeometry().attributes.position.array;
        for (let i = 0; i < points.length; i++) {
            const index = i * 3;
            const currentPos = new THREE.Vector3(positions[index], positions[index + 1], positions[index + 2]);
            currentPos.lerp(points[i], 0.02); // Gradually move towards target
            positions[index] = currentPos.x;
            positions[index + 1] = currentPos.y;
            positions[index + 2] = currentPos.z;
        }
        this.getParticleGeometry().attributes.position.needsUpdate = true;

        if ( this.fadeOutAnimate ) {
            const particleMaterial = this.getParticleMaterial();

            // Gradually reduce particle size and opacity
            particleMaterial.size *= 0.99;
            particleMaterial.opacity *= 0.99;
            if (particleMaterial.size < 2) {
                particleMaterial.size = 2; // Set a minimum size
            }
            if (particleMaterial.opacity < 0.03) {
                particleMaterial.opacity = 0; // Set a minimum opacity
                this.fadeOutAnimate = false;
            }
            particleMaterial.needsUpdate = true;
        }
    }
}