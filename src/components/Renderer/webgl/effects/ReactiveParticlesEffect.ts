import * as THREE from 'three';
import gsap from 'gsap';
import vertex from './entities/glsl/vertex.glsl';
import fragment from './entities/glsl/fragment.glsl';
import { ReactiveParticlesEffectSetting } from '../../../../api/projects';
import { BaseEffect, EffectProps } from './types';

export class ReactiveParticlesEffect extends BaseEffect<ReactiveParticlesEffectSetting> {
    time: number;

    holderObjects?: THREE.Object3D;
    material?: THREE.ShaderMaterial;

    opts: ReactiveParticlesEffectSetting;

    constructor(props: EffectProps<ReactiveParticlesEffectSetting>) {
        super(props);
        this.name = 'ReactiveParticlesManager';
        this.time = 0;

        this.opts = {
            startColor: props.settings?.startColor || 0xffffff,
            endColor: props.settings?.endColor || 0x00ffff,
            color: props.settings?.color ?? 'fixed',
            autoRotate: props.settings?.autoRotate ?? true,
            maxFreqValue: props.settings?.maxFreqValue ?? 3,
            animateFrequency: props.settings?.animateFrequency ?? true,
            animateShadows: props.settings?.animateShadows ?? true,
            varyingColors: props.settings?.varyingColors ?? false,
            attenuateNoise: props.settings?.attenuateNoise ?? 1,
            lineWidth: props.settings?.lineWidth || 1.1,
            transparent: props.settings?.transparent ?? true,
        };

        this.init();
    }

    init() {
        this.holderObjects = new THREE.Object3D();
        this.add(this.holderObjects);

        this.props.containerObject.add(this.holderObjects);

        this.material = new THREE.ShaderMaterial({
            side: THREE.DoubleSide,
            vertexShader: vertex,
            fragmentShader: fragment,
            transparent: this.opts.transparent,
            uniforms: {
                time: { value: 0 },
                offsetSize: { value: 2 },
                size: { value: this.opts.lineWidth },
                attenuateNoise: { value: this.opts.attenuateNoise },
                animateShadows: { value: this.opts.animateShadows },
                useVaryingColors: { value: this.opts.varyingColors },
                frequency: { value: 2 },
                amplitude: { value: 1 },
                offsetGain: { value: 0 },
                maxDistance: { value: 1.8 },
                startColor: {
                    value: new THREE.Color(this.opts.startColor),
                },
                endColor: { value: new THREE.Color(this.opts.endColor) },
            },
        });

        this.#bpmManager().addEventListener('beat', () => {
            console.log('reactive partcle effect bpmManager listner');
            this.onBPMBeat();
        });

        this.updateFrequency();
    }

    getHolderObjects() {
        return this.holderObjects;
    }

    getMaterial() {
        return this.material;
    }

    #audioManager() {
        return this.props.webgl.getAudioManager();
    }

    #bpmManager() {
        return this.props.webgl.getAudioManager().getBpmManager();
    }

    onBPMBeat() {
        // Calculate a reduced duration based on the BPM (beats per minute) duration
        const duration = this.#bpmManager().getBPMDuration() / 1000;

        if (this.#audioManager().isPlaying) {
            // Randomly determine whether to rotate the holder object
            if (Math.random() < 0.3 && this.opts.autoRotate) {
                gsap.to(this.holderObjects!.rotation, {
                    duration: Math.random() < 0.8 ? 15 : duration, // Either a longer or BPM-synced duration
                    // y: Math.random() * Math.PI * 2,
                    z: Math.random() * Math.PI,
                    ease: 'elastic.out(0.2)',
                });
            }

            this.updateFrequency();
        }
    }

    updateFrequency() {
        if (this.opts.animateFrequency) {
            // Animate the frequency uniform in the material, syncing with BPM if available
            gsap.to(this.material!.uniforms.frequency, {
                duration: this.#bpmManager()
                    ? (this.#bpmManager().getBPMDuration() / 1000) * 2
                    : 2,
                value: THREE.MathUtils.randFloat(0.5, this.opts.maxFreqValue!), // Random frequency value for dynamic visual changes
                ease: 'expo.easeInOut', // Smooth exponential transition for visual effect
            });
        }
    }

    update() {
        if (this.#audioManager().isPlaying) {
            if (this.opts.color === 'autoFull') {
                this.material!.uniforms.startColor.value = new THREE.Color(
                    this.#audioManager().getColor()
                );
            }

            const frequencyData = this.#audioManager().frequencyData;

            // Dynamically update amplitude based on the high frequency data from the audio manager
            this.material!.uniforms.amplitude.value =
                0.8 +
                THREE.MathUtils.mapLinear(
                    frequencyData.high,
                    0,
                    0.6,
                    -0.1,
                    0.2
                );

            // Update offset gain based on the low frequency data for subtle effect changes
            this.material!.uniforms.offsetGain.value = frequencyData.mid * 0.6;

            // Map low frequency data to a range and use it to increment the time uniform
            const t = THREE.MathUtils.mapLinear(
                frequencyData.low,
                0.6,
                1,
                0.2,
                0.5
            );
            this.time += THREE.MathUtils.clamp(t, 0.2, 0.5); // Clamp the value to ensure it stays within a desired range
        } else {
            // Set default values for the uniforms when audio is not playing
            this.material!.uniforms.frequency.value = 0.8;
            this.material!.uniforms.amplitude.value = 1;
            this.time += 0.2;
        }

        this.material!.uniforms.time.value = this.time;
    }
}
