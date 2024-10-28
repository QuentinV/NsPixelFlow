import * as THREE from 'three'
import gsap from 'gsap'

export default class DrawingMesh extends THREE.Object3D {
    constructor({ audioManager, bpmManager, containerObject, options }) {
        super()
        this.options = options;
        this.material = containerObject.getMaterial();
        this.containerObject = containerObject;
    }

    createDrawing(contours, nextContours) {
        this.contours = contours;

        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
        contours.forEach((points) => {
            points.forEach(point => {
                if (point.x < minX) minX = point.x;
                if (point.y < minY) minY = point.y;
                if (point.x > maxX) maxX = point.x;
                if (point.y > maxY) maxY = point.y;
            });
        });
        contours = contours.filter( c => c.length > 0 );
    
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;
    
        if (nextContours) {
          // find biggest shape
          let b = [];
          contours.forEach( c => {
            if ( b.length < c.length ) {
              b = c;
            }
          });
    
          const o1pts = contours.reduce((prev, c) => prev + c.length, 0);
          const o2pts = nextContours.reduce((prev, c) => prev + c.length, 0);
    
          const diff = o2pts-o1pts;
          if ( diff > 0 ) {
            // need to add some shapes
            let n = 0;
            while( n < diff ) {
              contours.push(b.map( pts => ({...pts})));
              n += b.length;
            }
          } 
        }   
        
        let convertedContours = contours.map((cp) => {
          return cp.map(point => {
              const adjustedX = (point.x - centerX) / 100;
              const adjustedY = -(point.y - centerY) / 100;
              return new THREE.Vector3(adjustedX, adjustedY, 0);
          });
        });
        
        if (this.options.increaseDetails) {
            convertedContours = convertedContours.map(cp => this.resamplePoints(cp, cp.length * this.options.increaseDetails));
        }

        if (nextContours) {
            nextContours = nextContours
                .filter( c => c.length > 0 )
                .map( cp => cp.map(point => {
                    const adjustedX = (point.x - centerX) / 100;
                    const adjustedY = -(point.y - centerY) / 100;
                    return new THREE.Vector3(adjustedX, adjustedY, 0);
                }) );

            if (this.options.increaseDetails) {
                nextContours = nextContours.map(cp => this.resamplePoints(cp, cp.length * this.options.increaseDetails));
            }
    
            convertedContours = convertedContours.map((cp, index) => {
                const targetCount = nextContours[index]?.length; 
                return targetCount ? this.resamplePoints(cp, targetCount) : null;
            }).filter( cp => !!cp );
        }
        
        // Create a points mesh using the box geometry and the shader material
        convertedContours.forEach( convertedContour => {
            const shape = new THREE.Shape(convertedContour);
            const geometry = new THREE.ShapeGeometry(shape);
            const pointsMesh = new THREE.Points(geometry, this.material)
            this.add(pointsMesh)
        })
    
        return this;
    }

    create(k, nextContours) {
        this.material.uniforms.offsetSize.value = Math.floor(30)//THREE.MathUtils.randInt(30, 60))
        this.material.needsUpdate = true;
        return this.createDrawing(this.options.drawings[k], nextContours);
    }

    resamplePoints(points, targetCount) {
        const resampled = [];
        const totalLength = points.reduce((sum, point, i) => {
            if (i > 0) {
                sum += points[i].distanceTo(points[i - 1]);
            }
            return sum;
        }, 0);
    
        const segmentLength = totalLength / (targetCount - 1);
        let currentLength = 0;
        resampled.push(points[0]);
    
        for (let i = 1; i < points.length; i++) {
            const segment = points[i].distanceTo(points[i - 1]);
            currentLength += segment;
    
            while (currentLength >= segmentLength) {
                const excess = currentLength - segmentLength;
                const ratio = (segment - excess) / segment;
                const newPoint = points[i - 1].clone().lerp(points[i], ratio);
                resampled.push(newPoint);
                currentLength = excess;
            }
        }
    
        if (resampled.length < targetCount) {
            resampled.push(points[points.length - 1]);
        }
    
        return resampled;
    }
    
    initPosition() {
        gsap.to(this.containerObject.position, {
            duration: 0.6,
            z: this.options.posZ ?? 9,
            ease: 'elastic.out(0.8)', // Elastic ease-out for a bouncy effect
        });
    }

    getContours() {
        return this.contours;
    }

}