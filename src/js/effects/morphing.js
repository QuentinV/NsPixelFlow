import { BaseEffect } from "./baseEffect";

export class MorphingEffect extends BaseEffect {
    constructor({ points, fadeOutTimer, containerObject, animator }) {
        super({ points, fadeOutTimer, containerObject, animator });
    }

    getType() {
        return 'transition';
    }
}