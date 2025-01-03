import * as THREE from 'three'
import gsap from 'gsap'

export default class DrawingMesh extends THREE.Object3D {
    constructor({ audioManager, bpmManager, containerObject, options }) {
        super()
        this.options = options;
        this.material = containerObject.getMaterial();
        this.containerObject = containerObject;

        this.options.increaseDetails = this.options.increaseDetails ?? 0;
        this.points = null;
    }

    createDrawing(contours, nextContours) {
        this.contours = contours;

        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
        contours.forEach((points) => {
            console.log('points length', points.length)
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

        this.points = convertedContours.flatMap( c => c );
        this.convertedContours = convertedContours;
    
        return this;
    }

    append() {
        this.convertedContours.forEach( convertedContour => {
            const geometry = new THREE.BufferGeometry();
            const vertices = new Float32Array(convertedContour.length * 3);
            
            for (let i = 0; i < convertedContour.length; i++) {
                vertices[i * 3] = convertedContour[i].x;
                vertices[i * 3 + 1] = convertedContour[i].y;
                vertices[i * 3 + 2] = 0; // z = 0
            }
            
            geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
            geometry.setAttribute('a_color', this.getVertexColors());
        
            const pointsMesh = new THREE.Points(geometry, this.material)
            this.add(pointsMesh)
        });
    }

    create(k, nextContours) {
        this.material.uniforms.offsetSize.value = Math.floor(30)
        this.material.needsUpdate = true;
        this.colors = this.options.drawings[k].colors;
        return this.createDrawing(this.options.drawings[k].points, nextContours);
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

    getPoints() {
        return this.points;
    }

    getVertexColors() {
        const colors = this.colors;
        if ( !colors ) return;

        const pts = this.convertedContours[0];
        const vertexColors = new Float32Array(pts.length * 4);
        
        for (let i = 0; i < pts.length; i++) {
            const c = colors[i] ? colors[i] : [0.0, 0.0, 0.0, 1.0];
            vertexColors[i * 4] = c[0];
            vertexColors[i * 4 + 1] = c[1];
            vertexColors[i * 4 + 2] = c[2];
            vertexColors[i * 4 + 3] = c[3];
        }
        
        return new THREE.BufferAttribute(vertexColors, 4)
    }
}