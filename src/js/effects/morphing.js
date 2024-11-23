import { BaseEffect } from "./baseEffect";

export class MorphingEffect extends BaseEffect {
    constructor({ options, points, fadeOutTimer, containerObject }) {
        super({ options, points, fadeOutTimer, containerObject });
    }

    getType() {
        return 'transition';
    }
}