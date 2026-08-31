import { EventStreamMarshaller } from '@aws-sdk/eventstream-marshaller'
import { toUtf8, fromUtf8 } from '@aws-sdk/util-utf8-node'
import MicrophoneStreamImport from 'microphone-stream'
import { downsampleBuffer, pcmEncode, getAudioEventMessage } from './utils'

// microphone-stream is a CommonJS module. When bundled via Vite/ESM the default
// export may be nested under `.default` — normalise here so `new MicrophoneStream()`
// always works regardless of the bundler's interop strategy.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MicrophoneStream = (MicrophoneStreamImport as any).default ?? MicrophoneStreamImport

interface MessageJsonAws {
  Transcript: {
    Results: {
      Alternatives: {
        Transcript: string
      }[]
      IsPartial: boolean
    }[]
  }
}

export type OnTranscribe = (message: string) => void

export type OnTranscribeError = (message: string, details?: unknown) => void

interface Transcribe {
  url: string
  stream: MediaStream | null
  onTranscribe: OnTranscribe
  onSilence?: () => void
  onError: OnTranscribeError
}

const SAMPLE_RATE = 8000
const STOP_MAX_WAIT_MS = 6000
const CLOSE_FALLBACK_TIMEOUT_MS = 3000

let inputSampleRate: number
let transcription = ''
let socket: WebSocket | null = null
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let micStream: any = null
let autocloseIfSilentTimer: NodeJS.Timeout | null = null
let isStopping = false
let stopResolve: (() => void) | null = null
let stopMaxTimer: NodeJS.Timeout | null = null
let closeFallbackTimer: NodeJS.Timeout | null = null
let closeRequested = false

// our converter between binary event streams messages and JSON
const eventStreamMarshaller = new EventStreamMarshaller(toUtf8, fromUtf8)

const clearStopTimers = () => {
  if (stopMaxTimer) {
    clearTimeout(stopMaxTimer)
    stopMaxTimer = null
  }
}

const clearCloseFallbackTimer = () => {
  if (closeFallbackTimer) {
    clearTimeout(closeFallbackTimer)
    closeFallbackTimer = null
  }
}

const resolvePendingStop = () => {
  clearStopTimers()
  clearCloseFallbackTimer()
  if (stopResolve) {
    stopResolve()
    stopResolve = null
  }
}

const resetSocketAndStream = () => {
  socket = null
  micStream = null
}

const forceStopAndResolve = () => {
  resetSocketAndStream()
  resolvePendingStop()
}

const stopMicStream = () => {
  try {
    micStream?.stop()
  } catch {
    // ignore
  }
}

const finalizeSocketTermination = () => {
  stopMicStream()
  resetSocketAndStream()
  resolvePendingStop()
}

const requestSocketClose = () => {
  if (closeRequested) {
    return
  }

  closeRequested = true
  clearStopTimers()

  if (!socket) {
    resolvePendingStop()
    return
  }

  clearCloseFallbackTimer()
  closeFallbackTimer = setTimeout(() => {
    forceStopAndResolve()
  }, CLOSE_FALLBACK_TIMEOUT_MS)

  try {
    if (socket.readyState === WebSocket.OPEN) {
      socket.close(1000, 'client stop')
    } else if (socket.readyState === WebSocket.CLOSED) {
      forceStopAndResolve()
    }
  } catch {
    forceStopAndResolve()
  }
}

export const stopTranscription = function (): Promise<void> {
  return new Promise<void>((resolve) => {
    if (!socket && !micStream) {
      resolve()
      return
    }

    isStopping = true
    stopResolve = resolve
    closeRequested = false

    try {
      micStream?.stop()
    } catch {
      // ignore
    }

    // Safety net to avoid waiting forever if AWS does not finish and close.
    stopMaxTimer = setTimeout(requestSocketClose, STOP_MAX_WAIT_MS)

    // Signal end-of-stream to AWS so it can flush final transcript events.
    const currentSocket = socket
    if (!currentSocket || currentSocket.readyState !== WebSocket.OPEN) {
      requestSocketClose()
      return
    }

    try {
      currentSocket.send(createEndOfStreamBinaryMessage() as Uint8Array<ArrayBuffer>)
    } catch {
      requestSocketClose()
    }
  })
}

export const transcribe = ({
  url,
  stream,
  onTranscribe,
  onSilence,
  onError,
}: Transcribe) => {
  transcription = ''
  isStopping = false
  clearStopTimers()
  clearCloseFallbackTimer()
  stopResolve = null
  closeRequested = false

  micStream = new MicrophoneStream()
  inputSampleRate = micStream.context.sampleRate

  socket = new WebSocket(url)
  socket.binaryType = 'arraybuffer'

  socket.onopen = function () {
    micStream.setStream(stream)

    micStream.on('data', (rawAudioChunk: Buffer) => {
      // the audio stream is raw audio bytes. Transcribe expects PCM with additional metadata, encoded as binary
      const binary = convertAudioToBinaryMessage(rawAudioChunk)
      const currentSocket = socket

      // Skip empty frames — sending zero-length binary causes an immediate AWS close (code 1005)
      if (currentSocket?.readyState === WebSocket.OPEN && binary.length > 0) {
        currentSocket.send(binary as Uint8Array<ArrayBuffer>)
      }
    })
  }

  socket.onmessage = function (message) {
    try {
      // convert the binary event stream message to JSON
      const messageWrapper = eventStreamMarshaller.unmarshall(
        Buffer.from(message.data),
      )

      if (messageWrapper.headers[':message-type'].value === 'event') {
        const messageBody: MessageJsonAws = JSON.parse(
          String.fromCharCode(...messageWrapper.body),
        )
        handleEventStreamMessage(messageBody, onTranscribe, onSilence)
      } else {
        stopTranscription()
        onError('incorrect stream from aws', messageWrapper)
      }
    } catch (err) {
      onError('failed to parse message from aws', err)
    }
  }

  socket.onerror = function (event) {
    if (!isStopping) {
      onError('socket closed due to error', event)
    }

    finalizeSocketTermination()
  }

  socket.onclose = function (event) {
    if (!isStopping && event.code !== 1000) {
      onError(`socket closed abnormally (code ${event.code})`, event)
    }

    finalizeSocketTermination()
  }
}

function handleEventStreamMessage (
  messageJson: MessageJsonAws,
  onTranscribe: OnTranscribe,
  onSilence?: () => void,
) {
  const results = messageJson.Transcript.Results

  if (results && results.length > 0) {
    if (autocloseIfSilentTimer !== null) {
      clearTimeout(autocloseIfSilentTimer)
      autocloseIfSilentTimer = null
    }

    if (results[0].Alternatives.length > 0) {
      const transcriptCoded = results[0].Alternatives[0].Transcript
      const transcript = decodeURIComponent(escape(transcriptCoded))

      // if this transcript segment is final, add it to the overall transcription
      if (!results[0].IsPartial) {
        transcription += `${transcript}\n`
        onTranscribe(transcription)
      } else {
        // Publish a best-effort transcript while speech is still partial so
        // fast stop actions don't lose the trailing spoken segment.
        onTranscribe(`${transcription}${transcript}`)
      }
    }
  } else if (results.length === 0 && onSilence) {
    onSilence()
  }
}

function createEndOfStreamBinaryMessage (): Uint8Array {
  const endMessage = getAudioEventMessage(Buffer.alloc(0))
  const binary = eventStreamMarshaller.marshall(endMessage)

  return new Uint8Array(binary.buffer, binary.byteOffset, binary.byteLength)
}

function convertAudioToBinaryMessage (audioChunk: Buffer): Uint8Array {
  const raw = MicrophoneStream.toRaw(audioChunk)

  if (raw === null || raw.length === 0) {
    return new Uint8Array(0)
  }

  // downsample and convert the raw audio bytes to PCM
  const downsampledBuffer = downsampleBuffer(raw, inputSampleRate, SAMPLE_RATE)
  const pcmEncodedBuffer = pcmEncode(downsampledBuffer)

  // add the right JSON headers and structure to the message
  const audioEventMessage = getAudioEventMessage(Buffer.from(pcmEncodedBuffer))

  // convert the JSON object + headers into a binary event stream message
  const binary = eventStreamMarshaller.marshall(audioEventMessage)

  return new Uint8Array(binary.buffer, binary.byteOffset, binary.byteLength)
}
