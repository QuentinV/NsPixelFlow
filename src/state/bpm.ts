import { EventDispatcher } from 'three';
import { guess } from 'web-audio-beat-detector';

export class BPMManager extends EventDispatcher<{
    beat: { type: 'beat' };
}> {
    interval: number; // Interval for beat events
    intervalId?: any; // Timer ID for beat interval
    bpmValue: number; // BPM value

    constructor() {
        super();
        this.interval = 500;
        this.bpmValue = 0;
    }

    #setBPM(bpm: number) {
        // Sets BPM and starts interval to emit beat events
        this.interval = 60000 / bpm;
        clearInterval(this.intervalId);
        this.intervalId = setInterval(
            this.#updateBPM.bind(this),
            this.interval
        );
    }

    #updateBPM() {
        this.dispatchEvent({ type: 'beat' });
    }

    async detectBPM(audioBuffer: AudioBuffer) {
        const { bpm } = await guess(audioBuffer);
        this.#setBPM(bpm);
        console.log(`BPM detected: ${bpm}`);
    }

    getBPMDuration() {
        return this.interval;
    }
}

export const bpmManager = new BPMManager();
