import { BaseEffect } from "./baseEffect";

export class MorphingEffect extends BaseEffect {
    constructor({ points, fadeOutTimer, containerObject }) {
        super({ points, fadeOutTimer, containerObject });
    }

    getType() {
        return 'transition';
    }
}