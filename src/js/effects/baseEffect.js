import * as THREE from 'three'

export class BaseEffect {
    getParticleGeometry() {
        return this.particleGeometry;
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
    }
}