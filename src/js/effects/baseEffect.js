import { AttractionAnimator } from "./animators/attraction";
import { DrawingAnimator } from "./animators/drawing";

const animators = {
    attraction: AttractionAnimator,
    drawing: DrawingAnimator
}

export class BaseEffect {
    constructor({ options, points, vertexColors, fadeOutTimer, containerObject }) {
        this.points = points;
        this.vertexColors = vertexColors;
        if ( fadeOutTimer ) {
            setTimeout(() => {
                this.fadeOutAnimate = true;
            }, fadeOutTimer);
        }
        this.options = options;
        this.containerObject = containerObject;
        this.material = containerObject?.getMaterial();
        this.morphProgress = 0;
        this.animator = new animators[options.animator || 'attraction']({ options });
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
        this.morphProgress += this.animator.getProgressIncrease();

        this.animator.animate({ progress: this.morphProgress, containerObject: this.containerObject, points: this.getPoints() });

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