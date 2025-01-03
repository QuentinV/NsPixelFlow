import * as THREE from 'three'

const noteFrequencies = [
  { note: 'C4', frequency: 261.63, color: 'red' },
  { note: 'C#4/Db4', frequency: 277.18, color: 'orange' },
  { note: 'D4', frequency: 293.66, color: 'yellow' },
  { note: 'D#4/Eb4', frequency: 311.13, color: 'green' },
  { note: 'E4', frequency: 329.63, color: 'blue' },
  { note: 'F4', frequency: 349.23, color: 'indigo' },
  { note: 'F#4/Gb4', frequency: 369.99, color: 'violet' },
  { note: 'G4', frequency: 392.00, color: 'red' },
  { note: 'G#4/Ab4', frequency: 415.30, color: 'orange' },
  { note: 'A4', frequency: 440.00, color: 'yellow' },
  { note: 'A#4/Bb4', frequency: 466.16, color: 'green' },
  { note: 'B4', frequency: 493.88, color: 'blue' },
  { note: 'C5', frequency: 523.25, color: 'indigo' }
];

export default class AudioManager {
  constructor(options) {
    this.frequencyArray = []
    this.frequencyData = {
      low: 0,
      mid: 0,
      high: 0,
    }
    this.isPlaying = false
    this.lowFrequency = 10 //10Hz to 250Hz
    this.midFrequency = 150 //150Hz to 2000Hz
    this.highFrequency = 9000 //2000Hz to 20000Hz
    this.smoothedLowFrequency = 0
    this.audioContext = null
    this.color = 'blue';

    this.song = {
      url: options.songUrl
    }
  }

  async loadAudioBuffer() {
    // Load the audio file and create the audio buffer
    const promise = new Promise(async (resolve, reject) => {
      const audioListener = new THREE.AudioListener()
      this.audio = new THREE.Audio(audioListener)
      const audioLoader = new THREE.AudioLoader()

      audioLoader.load(this.song.url, (buffer) => {
        this.audio.setBuffer(buffer)
        this.audio.setLoop(false)
        this.audio.setVolume(1)
        this.audioContext = this.audio.context
        this.bufferLength = this.audioAnalyser.data.length
        resolve()
      })
      
      this.audioAnalyser = new THREE.AudioAnalyser(this.audio, 1024)
    })

    return promise
  }

  setStartTime(musicStartTime) {
    this.musicStartTime = musicStartTime;
  }

  getCurrentTimeWithOffset() {
    return this.audio.context.currentTime - (this.musicStartTime/1000);
  }

  play() {
    this.audio.play()
    this.isPlaying = true
  }

  pause() {
    this.audio.pause()
    this.isPlaying = false
  }

  onEnded(callback) {
    this.audio.onEnded = () => {
      this.isPlaying = false;
      callback?.();
    }
  }

  collectAudioData() {
    this.frequencyArray = this.audioAnalyser.getFrequencyData()
  }

  analyzeFrequency() {
    // Calculate the average frequency value for each range of frequencies
    const lowFreqRangeStart = Math.floor((this.lowFrequency * this.bufferLength) / this.audioContext.sampleRate)
    const lowFreqRangeEnd = Math.floor((this.midFrequency * this.bufferLength) / this.audioContext.sampleRate)
    const midFreqRangeStart = Math.floor((this.midFrequency * this.bufferLength) / this.audioContext.sampleRate)
    const midFreqRangeEnd = Math.floor((this.highFrequency * this.bufferLength) / this.audioContext.sampleRate)
    const highFreqRangeStart = Math.floor((this.highFrequency * this.bufferLength) / this.audioContext.sampleRate)
    const highFreqRangeEnd = this.bufferLength - 1

    const lowAvg = this.normalizeValue(this.calculateAverage(this.frequencyArray, lowFreqRangeStart, lowFreqRangeEnd))
    const midAvg = this.normalizeValue(this.calculateAverage(this.frequencyArray, midFreqRangeStart, midFreqRangeEnd))
    const highAvg = this.normalizeValue(this.calculateAverage(this.frequencyArray, highFreqRangeStart, highFreqRangeEnd))

    this.frequencyData = {
      low: lowAvg,
      mid: midAvg,
      high: highAvg,
    }
  }

  calculateAverage(array, start, end) {
    let sum = 0
    for (let i = start; i <= end; i++) {
      sum += array[i]
    }
    return sum / (end - start + 1)
  }

  normalizeValue(value) {
    // Assuming the frequency values are in the range 0-256 (for 8-bit data)
    return value / 256
  }

  getPredominantFrequency() {
      let maxAmplitude = 0;
      let dominantFrequency = 0;
      
      this.frequencyArray.forEach( (f, i) => {
        if (f > maxAmplitude) {
            maxAmplitude = f;
            dominantFrequency = i * (this.audioContext.sampleRate / 2) / this.frequencyArray.length;
        }
      })
      
      return dominantFrequency;
  }

  _getNoteAndColor(frequency) {
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
      return this._getNoteAndColor(dominantFrequency)?.color;
  }

  getColor() {
    return this.color;
  }

  update() {
    if (!this.isPlaying) return

    this.collectAudioData()
    this.analyzeFrequency()
    this.color = this.analyzeColor();
  }
}
