
export class AttractionAnimator {
    constructor() {
        //
    }

    animate({ progress, containerObject, points }) {
        const morphProgress = 1 - Math.pow(1 - progress, 2);//3 * Math.pow(this.morphProgress, 2) - 2 * Math.pow(this.morphProgress, 3);
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
    }
}