import { AttractionAnimator } from "./animators/attraction";
import { StepperAnimator } from "./animators/stepper";

const animators = {
    attraction: AttractionAnimator,
    stepper: StepperAnimator
}

export class BaseEffect {
    constructor({ points, fadeOutTimer, containerObject, animator }) {
        this.points = points;
        if ( fadeOutTimer ) {
            setTimeout(() => {
                this.fadeOutAnimate = true;
            }, fadeOutTimer);
        }
        this.containerObject = containerObject;
        this.material = containerObject?.getMaterial();
        this.morphProgress = 0;
        this.animator = new animators[animator || 'attraction'];
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