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

let inputSampleRate: number
let transcription = ''
let socket: WebSocket
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let micStream: any
let autocloseIfSilentTimer: NodeJS.Timeout | null

// our converter between binary event streams messages and JSON
const eventStreamMarshaller = new EventStreamMarshaller(toUtf8, fromUtf8)

export const stopTranscription = function () {
  if (socket && socket.readyState === socket.OPEN && micStream) {
    micStream.stop()
    socket.close()
  }
}

export const transcribe = ({
  url,
  stream,
  onTranscribe,
  onSilence,
  onError,
}: Transcribe) => {
  transcription = ''

  micStream = new MicrophoneStream()
  inputSampleRate = micStream.context.sampleRate

  socket = new WebSocket(url)
  socket.binaryType = 'arraybuffer'

  socket.onopen = function () {
    micStream.setStream(stream)

    micStream.on('data', (rawAudioChunk: Buffer) => {
      // the audio stream is raw audio bytes. Transcribe expects PCM with additional metadata, encoded as binary
      const binary = convertAudioToBinaryMessage(rawAudioChunk)

      // Skip empty frames — sending zero-length binary causes an immediate AWS close (code 1005)
      if (socket.readyState === socket.OPEN && binary.length > 0) {
        socket.send(binary)
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
    stopTranscription()
    onError('socket closed due to error', event)
  }

  socket.onclose = function (event) {
    micStream.stop()
    if (event.code !== 1000) {
      onError(`socket closed abnormally (code ${event.code})`, event)
    }
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
      }
    }
  } else if (results.length === 0 && onSilence) {
    onSilence()
  }
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

  return binary
}
