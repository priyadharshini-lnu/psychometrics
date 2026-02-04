import { Message } from '@aws-sdk/eventstream-marshaller'

export function pcmEncode (input: Float32Array): ArrayBuffer {
  let offset = 0
  const buffer = new ArrayBuffer(input.length * 2)
  const view = new DataView(buffer)
  for (let i = 0; i < input.length; i += 1, offset += 2) {
    const s = Math.max(-1, Math.min(1, input[i]))
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true)
  }
  return buffer
}

export function downsampleBuffer (
  buffer: Float32Array,
  inputSampleRate = 44100,
  outputSampleRate = 16000,
): Float32Array {
  if (outputSampleRate === inputSampleRate) {
    return buffer
  }

  const sampleRateRatio = inputSampleRate / outputSampleRate
  const newLength = Math.round(buffer.length / sampleRateRatio)
  const result = new Float32Array(newLength)
  let offsetResult = 0
  let offsetBuffer = 0

  while (offsetResult < result.length) {
    const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio)

    let accum = 0
    let count = 0

    for (
      let i = offsetBuffer;
      i < nextOffsetBuffer && i < buffer.length;
      i += 1
    ) {
      accum += buffer[i]
      count += 1
    }

    result[offsetResult] = accum / count
    offsetResult += 1
    offsetBuffer = nextOffsetBuffer
  }

  return result
}

export function getAudioEventMessage (buffer: Buffer): Message {
  return {
    headers: {
      ':message-type': {
        type: 'string',
        value: 'event',
      },
      ':event-type': {
        type: 'string',
        value: 'AudioEvent',
      },
    },
    body: new Uint8Array(buffer) as Uint8Array<ArrayBuffer>,
  }
}
