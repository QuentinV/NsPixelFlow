import * as THREE from 'three';
import { Audio, Project } from '../api/projects';
import { createEffect, createEvent, createStore, sample } from 'effector';
import { loadProjectFromStorageFx } from './projects';
import { BPMManager, bpmManager } from './bpm';

const noteFrequencies = [
    { note: 'C4', frequency: 261.63, color: 'red' },
    { note: 'C#4/Db4', frequency: 277.18, color: 'orange' },
    { note: 'D4', frequency: 293.66, color: 'yellow' },
    { note: 'D#4/Eb4', frequency: 311.13, color: 'green' },
    { note: 'E4', frequency: 329.63, color: 'blue' },
    { note: 'F4', frequency: 349.23, color: 'indigo' },
    { note: 'F#4/Gb4', frequency: 369.99, color: 'violet' },
    { note: 'G4', frequency: 392.0, color: 'red' },
    { note: 'G#4/Ab4', frequency: 415.3, color: 'orange' },
    { note: 'A4', frequency: 440.0, color: 'yellow' },
    { note: 'A#4/Bb4', frequency: 466.16, color: 'green' },
    { note: 'B4', frequency: 493.88, color: 'blue' },
    { note: 'C5', frequency: 523.25, color: 'indigo' },
];

export interface AudioSettings extends Audio {
    file?: File;
}

export class AudioManager {
    settings: Audio;
    frequencyArray?: Uint8Array<ArrayBufferLike>;
    frequencyData: { low: number; mid: number; high: number };
    isPlaying: boolean;

    lowFrequency: number;
    midFrequency: number;
    highFrequency: number;

    smoothedLowFrequency: number;
    color: string;

    listener?: THREE.AudioListener;
    audio?: THREE.Audio;
    analyser?: THREE.AudioAnalyser;
    bufferLength: number;
    clonedBuffer?: ArrayBuffer;

    musicStartTime?: number;

    bpmManager: BPMManager;

    constructor({ bpmManager }: { bpmManager: BPMManager }) {
        this.settings = {};

        this.frequencyData = {
            low: 0,
            mid: 0,
            high: 0,
        };
        this.isPlaying = false;
        this.lowFrequency = 10; //10Hz to 250Hz
        this.midFrequency = 150; //150Hz to 2000Hz
        this.highFrequency = 9000; //2000Hz to 20000Hz
        this.smoothedLowFrequency = 0;
        this.color = 'blue';
        this.bufferLength = 0;

        this.listener = new THREE.AudioListener();
        this.bpmManager = bpmManager;
    }

    save(): Audio {
        return this.settings;
    }

    async load(settings?: Audio) {
        this.settings = settings ?? {};
        if (this.settings.data) {
            await this.loadFromArrayBuffer(
                this.#base64ToArrayBuffer(this.settings.data),
                this.settings.name
            );
        }
    }

    async loadFromArrayBuffer(
        audioData: ArrayBuffer,
        name?: string
    ): Promise<void> {
        if (!this.listener) return;

        const listener = this.listener;

        this.audio = new THREE.Audio(listener);
        this.analyser = new THREE.AudioAnalyser(this.audio, 1024);

        this.clonedBuffer = audioData.slice(0) as ArrayBuffer;
        const audioContext = listener.context;
        const audio = this.audio!;

        return new Promise((resolve, reject) => {
            audioContext.decodeAudioData(audioData as ArrayBuffer, (buffer) => {
                audio.setBuffer(buffer);
                audio.setLoop(false);
                audio.setVolume(this.settings.volume ?? 1);

                this.settings.name = name ?? this.settings.name;
                this.settings.duration = buffer.duration;
                this.settings.data = btoa(
                    new Uint8Array(this.clonedBuffer!).reduce(
                        (acc, val) => (acc += String.fromCharCode(val)),
                        ''
                    )
                );
                this.bufferLength = this.analyser?.data.length ?? 0;

                resolve();
            });
        });
    }

    getClonedBuffer(): ArrayBuffer | undefined {
        return this.clonedBuffer?.slice(0);
    }

    #base64ToArrayBuffer(base64: string): ArrayBuffer {
        const binary = atob(base64);
        const buffer = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            buffer[i] = binary.charCodeAt(i);
        }
        return buffer.buffer;
    }

    setStartTime(musicStartTime: number) {
        this.musicStartTime = musicStartTime;
    }

    getCurrentTimeWithOffset() {
        if (!this.audio) return 0;
        return (
            this.audio.context.currentTime - (this.musicStartTime ?? 0) / 1000
        );
    }

    async play() {
        await this.bpmManager.detectBPM(this.audio?.buffer!);
        this.audio?.play();
        this.isPlaying = true;
    }

    pause() {
        this.audio?.pause();
        this.isPlaying = false;
    }

    onEnded(callback: () => void) {
        if (!this.audio) return;
        this.audio.onEnded = () => {
            this.isPlaying = false;
            callback?.();
        };
    }

    collectAudioData() {
        this.frequencyArray = this.analyser?.getFrequencyData();
    }

    analyzeFrequency() {
        const sampleRate = this.listener?.context.sampleRate;
        if (sampleRate === undefined) return;

        // Calculate the average frequency value for each range of frequencies
        const lowFreqRangeStart = Math.floor(
            (this.lowFrequency * this.bufferLength) / sampleRate
        );
        const lowFreqRangeEnd = Math.floor(
            (this.midFrequency * this.bufferLength) / sampleRate
        );
        const midFreqRangeStart = Math.floor(
            (this.midFrequency * this.bufferLength) / sampleRate
        );
        const midFreqRangeEnd = Math.floor(
            (this.highFrequency * this.bufferLength) / sampleRate
        );
        const highFreqRangeStart = Math.floor(
            (this.highFrequency * this.bufferLength) / sampleRate
        );
        const highFreqRangeEnd = this.bufferLength - 1;

        const lowAvg = this.#normalizeValue(
            this.#calculateAverage(
                this.frequencyArray!,
                lowFreqRangeStart,
                lowFreqRangeEnd
            )
        );
        const midAvg = this.#normalizeValue(
            this.#calculateAverage(
                this.frequencyArray!,
                midFreqRangeStart,
                midFreqRangeEnd
            )
        );
        const highAvg = this.#normalizeValue(
            this.#calculateAverage(
                this.frequencyArray!,
                highFreqRangeStart,
                highFreqRangeEnd
            )
        );

        this.frequencyData = {
            low: lowAvg,
            mid: midAvg,
            high: highAvg,
        };
    }

    #calculateAverage(
        array: Uint8Array<ArrayBufferLike>,
        start: number,
        end: number
    ) {
        let sum = 0;
        for (let i = start; i <= end; i++) {
            sum += array[i];
        }
        return sum / (end - start + 1);
    }

    #normalizeValue(value: number) {
        // Assuming the frequency values are in the range 0-256 (for 8-bit data)
        return value / 256;
    }

    getPredominantFrequency() {
        if (!this.frequencyArray?.length) return 0;

        let maxAmplitude = 0;
        let dominantFrequency = 0;

        this.frequencyArray.forEach((f, i) => {
            if (f > maxAmplitude) {
                maxAmplitude = f;
                dominantFrequency =
                    (i * (this.listener!.context.sampleRate / 2)) /
                    this.frequencyArray!.length;
            }
        });

        return dominantFrequency;
    }

    #getNoteAndColor(frequency: number) {
        let closestNote = noteFrequencies[0];
        let minDiff = Math.abs(frequency - closestNote.frequency);

        for (let i = 1; i < noteFrequencies.length; i++) {
            const diff = Math.abs(frequency - noteFrequencies[i].frequency);
            if (diff < minDiff) {
                closestNote = noteFrequencies[i];
                minDiff = diff;
            }
        }

        return { note: closestNote.note, color: closestNote.color };
    }

    analyzeColor() {
        const dominantFrequency = this.getPredominantFrequency();
        return this.#getNoteAndColor(dominantFrequency)?.color;
    }

    getColor() {
        return this.color;
    }

    getListener() {
        return this.listener;
    }

    getBpmManager() {
        return this.bpmManager;
    }

    update() {
        if (!this.isPlaying) return;

        this.collectAudioData();
        this.analyzeFrequency();
        this.color = this.analyzeColor();
    }
}

export const audioManager = new AudioManager({ bpmManager });

export const $audio = createStore<Audio | null>(null);
export const updateAudioSettings = createEvent<Audio>();

$audio
    .on(
        loadProjectFromStorageFx.doneData,
        (_, project) => project?.settings?.audio?.[0] ?? {}
    )
    .on(updateAudioSettings, (_, audio) => ({ ...audio }));

export const loadAudioFileFx = createEffect(
    (file: File): Promise<void> =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsArrayBuffer(file);
            reader.onload = (e) => {
                const audioData = e?.target?.result;
                if (!audioData) {
                    reject(new Error('Failed to load audio data'));
                    return;
                }
                audioManager
                    .loadFromArrayBuffer(audioData as ArrayBuffer, file.name)
                    .then(resolve)
                    .catch(reject);
            };
        })
);

sample({
    source: loadProjectFromStorageFx.doneData,
    target: createEffect((project: Project) => {
        audioManager.load(project.settings?.audio?.[0]);
    }),
});

sample({
    source: loadAudioFileFx.doneData,
    fn: () => audioManager.save(),
    target: updateAudioSettings,
});
