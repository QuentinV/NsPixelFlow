export class BaseEffect {
    constructor({ points, fadeOutTimer, containerObject }) {
        this.points = points;
        if ( fadeOutTimer ) {
            setTimeout(() => {
                this.fadeOutAnimate = true;
            }, fadeOutTimer);
        }
        this.containerObject = containerObject;
        this.material = containerObject?.getMaterial();
        this.morphProgress = 0;
    }

    getType() {
        return 'preload';
    }

    getParticleMaterial() {
        return this.material;
    }
    
    getPoints() {
        return this.points;
    }

    isDone() {
        return this.morphProgress >= 1;
    }

    animate() {
        if ( this.morphProgress >= 1 ) return;

        this.morphProgress += 0.015;

        const morphProgress = 1 - Math.pow(1 - this.morphProgress, 2);//3 * Math.pow(this.morphProgress, 2) - 2 * Math.pow(this.morphProgress, 3);
        function interpolate(start, end) { 
            return start * (1 - morphProgress) + end * morphProgress; 
        }

        const geometries = this.containerObject.getHolderObjects().children[0].children.map( child => child.geometry );
        const points = this.getPoints();
        if ( !this.originalPositions ) {    
            this.originalPositions = geometries.flatMap( g => [...g.attributes.position.array.slice()] );
        }

        let k = 0;
        let pk = 0;
        const getNextPoints = () => {
            if ( k >= geometries.length ) {
                return null;
            }
            let pos = geometries[k].attributes.position.array;
            if ( pk >= pos.length ) {
                pk = 0; 
                k++;
                return getNextTargetPoints();
            }
            
            const o = { pos, index: pk };
            pk = pk + 3;

            return o;
        }

        for (let i = 0; i < points.length; i++) {
            const { pos, index } = getNextPoints();
            const origIndex = i * 3;

            pos[index] = interpolate(this.originalPositions[origIndex], points[i].x);
            pos[index + 1] = interpolate(this.originalPositions[origIndex + 1], points[i].y);
            pos[index + 2] = interpolate(this.originalPositions[origIndex + 2], points[i].z);
        }
        
        geometries.forEach( g => {
            g.attributes.position.needsUpdate = true;
        })

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