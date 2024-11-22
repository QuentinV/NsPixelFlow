
export class DrawingAnimator {
    constructor() {
        this.positionIndex = 0;
    }

    getProgressIncrease() {
        return this.morphProgressIncrease ? this.morphProgressIncrease : 0;
    }

    getNextPoints() {
        if ( this.k >= this.geometries.length ) {
            return null;
        }
        let pos = this.geometries[this.k].attributes.position.array;
        if ( this.pk >= pos.length ) {
            this.pk = 0; 
            this.k++;
            return this.getNextPoints();
        }
        
        const o = { pos, index: this.pk };
        this.pk = this.pk + 3;

        return o;
    }

    animate({ progress, containerObject, points }) {
        if ( !this.geometries ) {    
            this.geometries = containerObject.getHolderObjects().children[0].children.map( child => child.geometry );
            const totalPositions = this.geometries.reduce( (t, g) => t + g.attributes.position.array.length, 0 ) / 3;

            const totalTime = 30000;
            const refreshTime = 24;
            const totalTickers = totalTime / refreshTime;
            this.morphProgressIncrease = 1 / totalTickers;
            this.amountPositionsPerTick = Math.floor(totalPositions / totalTickers);

            this.k = 0;
            this.pk = 0;

            return;
        }

        for ( let i = 0; i < this.amountPositionsPerTick; ++i ) {
            const next = this.getNextPoints();
            if ( !next ) continue;
            const { pos, index } = next;
            const point = points[this.positionIndex];

            pos[index] = point.x;
            pos[index+1] = point.y;
            pos[index+2] = point.z;

            this.positionIndex++;
        }
        
        this.geometries.forEach( g => {
            g.attributes.position.needsUpdate = true;
        });
    }
}