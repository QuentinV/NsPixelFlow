import CubeMesh from "../meshes/CubeMesh";
import CylinderMesh from "../meshes/CylinderMesh";
import DrawingMesh from "../meshes/DrawingMesh";

const meshes = {
    drawing: () => DrawingMesh,
    box: () => CubeMesh,
    cylinder: () => CylinderMesh,
    random: () => Math.random() < 0.5 ? CubeMesh : CylinderMesh,
    'default': () =>CubeMesh
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

        this.properties.k = 1;
        this.morphProgress = 0;
        this.morphTimeout = null;
        this.objects = [null, null];

        if ( this.properties.imagesSyncUrl ) {
            console.log('imagesSyncUrl', this.properties.imagesSyncUrl)
            this.imagesSync = await loadImagesSync({ url: this.properties.imagesSyncUrl });
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
        const images = (await fetch(url)).json();
        let index = 0;
        let loading = false;

        this.properties.drawings[0] = (await fetch('http://localhost:8080/storage/')).json();

        setInterval(async () => {
          if (loading || !this.audioManager.isPlaying) return;
          const currentTime = this.audioManager.audi.context.currentTime;
          if ( images[index].start >= currentTime ) {
            if ( index+1 < images.length ) {
                // prefetch next image for smooth transition
                fetch(images[index+1].url).then( async res => {
                    this.properties.drawings[index+1] = (await res.json()).contours;
                });
            }      
            await this.nextMesh('drawing');
          }
        }, 100);
    }

    async nextMesh(shape) {
        //console.log('next mesh');

        this.holderObjects?.clear();

        let MeshCla = meshes[shape]?.();
        if ( !MeshCla ) MeshCla = meshes.default?.();

        const mesh = new MeshCla({ audioManager: this.audioManager, containerObject: this.containerObject, options: this.properties });
        await mesh.create();
    
        if ( shape === 'drawing' && !this.properties.k ) {
            const nextContours = mesh.getContours();

            this.objects[0] = await this.objects[0].adjustTo(nextContours);
            this.objects[1] = nextMesh;
            nextMesh = this.objects[0];

            this.properties.k++;
        }
        
        mesh.initPosition();

        this.holderObjects.add(mesh);

        if ( shape === 'drawing' ) {
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
          console.log('morph done');
    
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
            }, 500 );
        }
    }    
}