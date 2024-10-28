import CubeMesh from "../meshes/CubeMesh";
import CylinderMesh from "../meshes/CylinderMesh";
import DrawingMesh from "../meshes/DrawingMesh";

const meshes = {
    drawing: () => DrawingMesh,
    box: () => CubeMesh,
    cylinder: () => CylinderMesh,
    random: () => Math.random() < 0.5 ? CubeMesh : CylinderMesh,
    'default': () => CubeMesh
}

export default class MeshManager {
    constructor({ audioManager, options }) {
        this.audioManager = audioManager;
        this.properties = {
            ...options,
            imagesSyncUrl: options.imagesSyncUrl,
            drawings: options.drawings,
            autoMix: (options.autoMix ?? true) || options.shape === 'random',
            autoRotate: options.autoRotate ?? true,
            autoNext: options.autoNext ?? false,
            timerNext: 2000,
            keepRotate: options.keepRotate,
            rotateDuration: options.rotateDuration,
            shape: options.shape
        }
    }

    async init({ containerObject }) {
        this.containerObject = containerObject;
        this.holderObjects = this.containerObject.getHolderObjects();

        this.properties.k = 0;
        this.morphProgress = 0;
        this.morphTimeout = null;
        this.objects = [null, null];

        if ( this.properties.imagesSyncUrl ) {
            console.log('imagesSyncUrl', this.properties.imagesSyncUrl)
            this.imagesSync = await this.loadImagesSync({ url: this.properties.imagesSyncUrl });
        } else {
            await this.nextMesh(this.properties.shape);
        }
    }

    onBPMBeat() {
        if (this.properties.autoMix && Math.random() < 0.1) {
            this.nextMesh('random');
        }

        if ( this.properties.autoNext && !this.properties.imagesSyncUrl ) {
            setTimeout(() => this.nextMesh(this.properties.shape), this.properties.timerNext );
        }        
    }

    async loadImagesSync({ url }) {
        // { images: { start: number; url: string }[] } 
        const host = url.substring(0, url.lastIndexOf('/') + 1);
        const images = await (await fetch(url)).json();

        this.properties.drawings = [];
        const promises = images.map( v => fetch(host + v.url).then( res => res.json()));
        this.properties.drawings = await Promise.all(promises);
        console.log('prefetch drawing done')

        let index = 0;
        let loading = false;

        setInterval(() => {
            if (loading || !this.audioManager.isPlaying || index >= images.length) return;
            const currentTime = this.audioManager.audio.context.currentTime;
            if ( currentTime >= images[index].start + 0.5 ) {
                //console.log('swap', currentTime, images[index].start, index)
                this.nextMesh('drawing');
                index++;
            }
        }, 20);
    }

    async nextMesh(shape) {
        //console.log('next mesh');
        this.holderObjects.clear();

        let MeshCla = meshes[shape]?.();
        if ( !MeshCla ) MeshCla = meshes.default?.();

        let mesh = new MeshCla({ audioManager: this.audioManager, containerObject: this.containerObject, options: this.properties });
        await mesh.create(this.properties.k);
    
        if ( shape === 'drawing' ) {
            if ( this.properties.k > 0 ) {
                const nextContours = mesh.getContours();

                let oldMesh = new MeshCla({ audioManager: this.audioManager, containerObject: this.containerObject, options: this.properties });
                oldMesh.create(this.properties.k - 1, nextContours);

                this.objects[0] = oldMesh;
                this.objects[1] = mesh;
                mesh = this.objects[0];
            } else {
                this.objects[0] = mesh;
            }  

            this.properties.k++;
        }
        
        mesh?.initPosition();

        this.holderObjects.add(mesh);  

        if ( shape === 'drawing' && this.properties.k-1 > 0 ) {
            this.animateMorph = true;
        }
    }

    updateMorph() {
        if (!this.animateMorph) return;
    
        this.morphProgress += 0.01;
          
        if ( this.morphProgress <= 1/3 ) {
          const shapesTarget = this.objects[1].children;
          let k = 0;
          let j = 0;
          const getNextTargetPoints = () => {
              if ( k >= shapesTarget.length ) {
                return null;
              }
              let pos = shapesTarget[k].geometry.attributes.position.array;
              if ( j >= pos.length ) {
                j = 0; 
                k++;
                return getNextTargetPoints();
              }
              const pts = [pos[j], pos[j+1], pos[j+2]];
              j = j + 3;
              return pts;
          }
          
          this.objects[0].children.forEach((shape1, index) => {
            const pos1 = shape1.geometry.attributes.position.array;
            for (let i = 0; i < pos1.length; i = i + 3) {
              const targetPoints = getNextTargetPoints();
              if ( !targetPoints ) continue;
              
              pos1[i] = pos1[i] * (1 - this.morphProgress) + targetPoints[0] * this.morphProgress;
              pos1[i+1] = pos1[i+1] * (1 - this.morphProgress) + targetPoints[1] * this.morphProgress;
              pos1[i+2] = pos1[i+2] * (1 - this.morphProgress) + targetPoints[2] * this.morphProgress;
            }
    
            shape1.geometry.attributes.position.needsUpdate = true;
          });  
        } else {
          //console.log('morph done');
    
          this.animateMorph = false;
          this.morphProgress = 0;
    
          this.holderObjects?.clear();
          this.objects[0] = this.objects[1];
          this.objects[1] = null;
          this.holderObjects.add(this.objects[0]);
        }
    }

    update() {
        if ( this.animateMorph && !this.morphTimeout ) {
            this.morphTimeout = setTimeout(() => {
              this.updateMorph();
              this.morphTimeout = null;
            }, 24 );
        }
    }    
}