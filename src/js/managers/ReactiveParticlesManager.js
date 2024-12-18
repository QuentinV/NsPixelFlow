import * as THREE from 'three'
import gsap from 'gsap'
import vertex from '../entities/glsl/vertex.glsl'
import fragment from '../entities/glsl/fragment.glsl'

export default class ReactiveParticlesManager extends THREE.Object3D {
  constructor(audioManager, bpmManager, options) {
    super()
    const opts = options || {};
    this.name = 'ReactiveParticlesManager'
    this.time = 0
    this.audioManager = audioManager;
    this.bpmManager = bpmManager;
    this.properties = {
      startColor: opts.startColor || 0xffffff,
      endColor: opts.endColor || 0x00ffff,
      autoRotate: opts.autoRotate ?? true,
      maxFreqValue: opts.fMax || 3,
      animateFrequency: true,
      animateShadows: opts.animateShadows ?? true,
      attenuateNoise: opts.attenuateNoise ?? 1,
      lineWidth: opts.lineWidth || 1.1,
      transparent: opts.transparent ?? true
    }  
  }

  init() {
    this.holderObjects = new THREE.Object3D()
    this.add(this.holderObjects)

    this.material = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: this.properties.transparent,
      uniforms: {
        time: { value: 0 },
        offsetSize: { value: 2 },
        size: { value: this.properties.lineWidth },
        attenuateNoise: { value: this.properties.attenuateNoise },
        animateShadows: { value: this.properties.animateShadows },
        frequency: { value: 2 },
        amplitude: { value: 1 },
        offsetGain: { value: 0 },
        maxDistance: { value: 1.8 },
        startColor: { value: new THREE.Color(this.properties.startColor) },
        endColor: { value: new THREE.Color(this.properties.endColor) }        
      },
    })

    this.updateFrequency()
  }

  getHolderObjects() {
    return this.holderObjects;
  }

  getMaterial() {
    return this.material;
  }

  onBPMBeat() {
    // Calculate a reduced duration based on the BPM (beats per minute) duration
    const duration = this.bpmManager.getBPMDuration() / 1000

    if (this.audioManager.isPlaying) {
      // Randomly determine whether to rotate the holder object
      if (Math.random() < 0.3 && this.properties.autoRotate) {
        gsap.to(this.holderObjects.rotation, {
          duration: Math.random() < 0.8 ? 15 : duration, // Either a longer or BPM-synced duration
          // y: Math.random() * Math.PI * 2,
          z: Math.random() * Math.PI,
          ease: 'elastic.out(0.2)',
        })
      }

      this.updateFrequency();
    }
  }

  updateFrequency() { 
    if (this.properties.animateFrequency) {
      // Animate the frequency uniform in the material, syncing with BPM if available
      gsap.to(this.material.uniforms.frequency, {
        duration: this.bpmManager ? (this.bpmManager.getBPMDuration() / 1000) * 2 : 2,
        value: THREE.MathUtils.randFloat(0.5, this.properties.maxFreqValue), // Random frequency value for dynamic visual changes
        ease: 'expo.easeInOut', // Smooth exponential transition for visual effect
      })
    }
  }
  
  update() {
    if (this.audioManager?.isPlaying) {
      // Dynamically update amplitude based on the high frequency data from the audio manager
      this.material.uniforms.amplitude.value = 0.8 + THREE.MathUtils.mapLinear(this.audioManager.frequencyData.high, 0, 0.6, -0.1, 0.2)

      // Update offset gain based on the low frequency data for subtle effect changes
      this.material.uniforms.offsetGain.value = this.audioManager.frequencyData.mid * 0.6

      // Map low frequency data to a range and use it to increment the time uniform
      const t = THREE.MathUtils.mapLinear(this.audioManager.frequencyData.low, 0.6, 1, 0.2, 0.5)
      this.time += THREE.MathUtils.clamp(t, 0.2, 0.5) // Clamp the value to ensure it stays within a desired range
    } else {
      // Set default values for the uniforms when audio is not playing
      this.material.uniforms.frequency.value = 0.8
      this.material.uniforms.amplitude.value = 1
      this.time += 0.2
    }

    this.material.uniforms.time.value = this.time
  }
}
