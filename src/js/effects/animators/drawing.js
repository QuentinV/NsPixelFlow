
export class DrawingAnimator {
    constructor({ options }) {
        this.positionIndex = 0;
        this.properties = {
            timer: options.effectDuration || 10000,
            mode: options.animatorMode || 'timeline'
        };
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

    shuffleArray(array) { 
        for (let i = array.length - 1; i > 0; i--) { 
            const j = Math.floor(Math.random() * (i + 1)); 
            [array[i], array[j]] = [array[j], array[i]];
        } 
        return array; 
    }

    animate({ progress, containerObject, points }) {
        if ( !this.geometries ) {    
            this.geometries = containerObject.getHolderObjects().children[0].children.map( child => child.geometry );
            const totalPositions = this.geometries.reduce( (t, g) => t + g.attributes.position.array.length, 0 ) / 3;
            const refreshTime = 24;
            const totalTickers = this.properties.timer / refreshTime;
            this.morphProgressIncrease = 1 / totalTickers;
            this.amountPositionsPerTick = Math.floor(totalPositions / totalTickers);
            if ( this.amountPositionsPerTick <= 0 ) {
                this.amountPositionsPerTick = 1;
            }

            this.k = 0;
            this.pk = 0;

            this.indexes = ( this.properties.mode === 'random' ) ? this.shuffleArray([...[...Array(points.length)].keys()]) : [...points.keys()];

            return;
        }

        for ( let i = 0; i < this.amountPositionsPerTick; ++i ) {
            const next = this.getNextPoints();
            if ( !next ) continue;
            const { pos, index } = next;
            const point = points[this.indexes[this.positionIndex]];

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