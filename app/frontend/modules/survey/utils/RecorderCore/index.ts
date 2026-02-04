import { RECORDER_STATES } from '~/modules/survey/constants/media'
import RecorderWorker from './worker?worker'

declare global {
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Window { webkitAudioContext: AudioContext, $: any }
}

const { $ } = window

const frequencyAnalyserSettings = {
  minDecibels: -90,
  maxDecibels: -10,
  smoothingTimeConstant: 0.85,
  fftSize: 256,
}


const settings = {
  lowerFreqBound: 4,
  upperFreqBound: 30,
  minPulseScale: 0.7,
  maxPulseScale: 1.1,
  pulseScaleStep: 0.005,
}


interface ConfigObj {
  bufferLength: number,
  numChannels: number,
}

export class RecorderCore {
  config: ConfigObj

  onUpdateRecordTime: (duration: number) => void

  state: string

  worker: Worker

  startTime: number | null

  lastPauseTime: number | null

  totalPausedTime: number

  updateDurationTimer: number

  stream: MediaStream

  audioContext: AudioContext

  scriptProcessorNode: ScriptProcessorNode

  freqBufferLength: number

  freqDataArray: Uint8Array<ArrayBuffer>

  freqAnalyser: AnalyserNode

  sourceNode: MediaStreamAudioSourceNode

  userMedia?: Promise<MediaStream | void>

  constructor ({ onUpdateRecordTime }) {
    this.config = {
      bufferLength: 4096,
      numChannels: 1,
    }
    this.onUpdateRecordTime = onUpdateRecordTime

    this.setInitialTimer()
    this.state = RECORDER_STATES.INACTIVE

    this.worker = new RecorderWorker()
    this.worker.onmessage = (e: MessageEvent): void => {
      this.trigger(e.data.command, e.data.blob)
    }

    this.worker.onerror = (e: ErrorEvent): void => {
      this.trigger('worker-error', e)
    }
  }

  setInitialTimer (): void {
    this.startTime = null
    this.lastPauseTime = null
    this.totalPausedTime = 0
  }

  getWavFile (): Promise<unknown> {
    this.stop()

    const audioFile = new Promise((resolve, reject) => {
      // deepcode ignore InsufficientPostmessageValidation: Web workers uses same origin - browser enforces this
      this.worker.addEventListener('message', ({ data }) => {
        if (data.command === 'wav-delivered') {
          resolve(data.blob)
        } else {
          reject(data)
        }
      })
    })
    clearInterval(this.updateDurationTimer)
    this.setInitialTimer()

    this.worker.postMessage({
      command: 'export-wav',
    })

    return audioFile
  }

  setupAudioProcessing (stream: MediaStream): void {
    this.stream = stream

    // Create the audio context
    const AudioContext = window.AudioContext || window.webkitAudioContext
    this.audioContext = new AudioContext()
    this.scriptProcessorNode = this.audioContext.createScriptProcessor(
      this.config.bufferLength,
      this.config.numChannels,
      this.config.numChannels,
    )

    // Handle the actual input
    // If in recording mode, sends the recorded data to the worker
    this.scriptProcessorNode.onaudioprocess = (e): void => {
      if (this.state === RECORDER_STATES.RECORDING) {
        this.worker.postMessage({
          command: 'record',
          buffer: [e.inputBuffer.getChannelData(0)],
        })
      }
    }

    // Create analyzer for extracting audio data and configure it
    const freqAnalyser = this.audioContext.createAnalyser()
    freqAnalyser.minDecibels = frequencyAnalyserSettings.minDecibels
    freqAnalyser.maxDecibels = frequencyAnalyserSettings.maxDecibels
    freqAnalyser.smoothingTimeConstant = frequencyAnalyserSettings.smoothingTimeConstant
    freqAnalyser.fftSize = frequencyAnalyserSettings.fftSize
    this.freqBufferLength = freqAnalyser.frequencyBinCount
    this.freqDataArray = new Uint8Array(this.freqBufferLength)
    this.freqAnalyser = freqAnalyser

    // Creates the media stream, and connects the mic source to the
    // processor node
    this.sourceNode = this.audioContext.createMediaStreamSource(stream)
    this.sourceNode.connect(this.freqAnalyser)
    this.freqAnalyser.connect(this.scriptProcessorNode)
    this.scriptProcessorNode.connect(this.audioContext.destination)
  }

  getAverageMicFrequency (): number {
    this.freqAnalyser.getByteFrequencyData(this.freqDataArray)
    const sum = this.freqDataArray.reduce((prev, curr) => prev + curr, 0)

    return sum / this.freqBufferLength
  }

  getAudioPulse (): number {
    let frequency = this.getAverageMicFrequency()
    // Set outer bounds
    if (frequency > settings.upperFreqBound) {
      frequency = settings.upperFreqBound
    } else if (frequency < settings.lowerFreqBound) {
      frequency = settings.lowerFreqBound
    }

    // Normalize within min/max scale
    const normalized = (frequency - settings.lowerFreqBound) / settings.upperFreqBound
    const deltaScale = settings.maxPulseScale - settings.minPulseScale
    const vuScaled = deltaScale * normalized + settings.minPulseScale

    // Round to nearest step to reduce jitter
    return (
      Math.round(vuScaled / settings.pulseScaleStep) * settings.pulseScaleStep
    )
  }

  grabMic (): Promise<void | MediaStream> {
    if (!this.supported()) {
      return Promise.reject()
    }

    if (this.userMedia === undefined) {
      this.userMedia = navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          this.setupAudioProcessing(stream)
          this.worker.postMessage({
            command: 'init',
            config: {
              sampleRate: this.sourceNode.context.sampleRate,
              numChannels: this.config.numChannels,
            },
          })
        })
        .catch((e) => {
          let reason = 'blocked'
          if (
            e.name
            && [
              'NotSupportedError',
              'NotSupportedError',
              'NotAllowedError',
            ].indexOf(e.name) !== -1
          ) {
            reason = 'insecure-not-allowed'
          }
          delete this.userMedia
          return Promise.reject(reason)
        })
    }

    return this.userMedia
  }

  start (): void {
    this.grabMic()
      .then(() => {
        this.setState(RECORDER_STATES.RECORDING)
        const currentTime = performance.now()
        this.startTime = this.startTime || currentTime
        if (this.startTime === currentTime) {
          this.updateDurationTimer = window.setInterval(() => {
            if (this.state === RECORDER_STATES.INACTIVE) { return }

            if (this.lastPauseTime) {
              this.totalPausedTime = this.totalPausedTime + performance.now() - this.lastPauseTime
              this.lastPauseTime = 0
            }
            const duration = Math.round((performance.now() - (this.startTime || 0) - this.totalPausedTime) / 1000)
            this.onUpdateRecordTime(Math.abs(duration) || 0)
          }, 500)
        }
      })
      .catch((e) => {
        this.trigger(e)
      })
  }

  stop (): void {
    this.setState(RECORDER_STATES.INACTIVE)
    this.lastPauseTime = performance.now()
  }

  supported (): boolean {
    return (
      (window.AudioContext !== undefined
        || window.webkitAudioContext !== undefined)
      && navigator.mediaDevices !== undefined
      && navigator.mediaDevices.getUserMedia !== undefined
    )
  }

  releaseMic (): void {
    this.setState(RECORDER_STATES.INACTIVE)
    // Clear the buffers:
    this.worker.postMessage({
      command: 'clear',
    })

    this.stream.getAudioTracks().forEach(track => track.stop())
    this.sourceNode.disconnect()
    this.scriptProcessorNode.disconnect()
    this.audioContext.close()

    delete this.userMedia
  }

  setState (state: string): void {
    this.state = state
    this.trigger(this.state)
  }

  trigger (name: string, data?: Blob | ErrorEvent): void {
    $(window).trigger(name, [data])
  }
}
