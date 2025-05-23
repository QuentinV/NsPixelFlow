
export class AttractionAnimator {
    constructor({ options }) {
        this.properties = {
            progressFactor: options.progressFactor ?? 1
        };
    }

    getProgressIncrease() {
        return 0.015;
    }

    animate({ progress, containerObject, points }) {
        const morphProgress = 1 - Math.pow(1 - progress, this.properties.progressFactor);
        function interpolate(start, end) { 
            return start * (1 - morphProgress) + end * morphProgress; 
        }

        const geometries = containerObject.getHolderObjects().children[0].children.map( child => child.geometry );
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
                return getNextPoints();
            }
            
            const o = { pos, index: pk };
            pk = pk + 3;

            return o;
        }

        for (let i = 0; i < points.length; i++) {
            const pts = getNextPoints();
            if ( !pts ) continue;
            const { pos, index } = pts;
            const origIndex = i * 3;

            pos[index] = interpolate(this.originalPositions[origIndex], points[i].x);
            pos[index + 1] = interpolate(this.originalPositions[origIndex + 1], points[i].y);
            pos[index + 2] = interpolate(this.originalPositions[origIndex + 2], points[i].z);
        }
        
        geometries.forEach( g => {
            g.attributes.position.needsUpdate = true;
        })
    }
}