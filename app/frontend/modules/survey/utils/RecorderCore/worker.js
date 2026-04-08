let recLength = 0
let recBuffers = []
let sampleRate
let numChannels

// Listen to incoming messages
onmessage = function (e) {
  switch (e.data.command) {
    case 'init':
      init(e.data.config)
      break
    case 'record':
      record(e.data.buffer)
      break
    case 'export-wav':
      exportWAV()
      break
    case 'clear':
      clear()
      break
    default:
      throw Error()
  }
}

function init (config) {
  // eslint-disable-next-line prefer-destructuring
  sampleRate = config.sampleRate
  // eslint-disable-next-line prefer-destructuring
  numChannels = config.numChannels
  initBuffers()
}

function record (inputBuffer) {
  for (let channel = 0; channel < numChannels; channel += 1) {
    recBuffers[channel].push(inputBuffer[channel])
  }
  recLength += inputBuffer[0].length
}

function exportWAV () {
  const buffers = []
  let interleaved
  for (let channel = 0; channel < numChannels; channel += 1) {
    buffers.push(mergeBuffers(recBuffers[channel], recLength))
  }
  if (numChannels === 2) {
    interleaved = interleave(buffers[0], buffers[1])
  } else {
    // eslint-disable-next-line prefer-destructuring
    interleaved = buffers[0]
  }
  const dataview = encodeWAV(interleaved)
  const audioBlob = new Blob([dataview], { type: 'audio/wav' })

  postMessage({
    command: 'wav-delivered',
    blob: audioBlob,
  })
}

function clear () {
  recLength = 0
  recBuffers = []
  initBuffers()
}

function initBuffers () {
  for (let channel = 0; channel < numChannels; channel += 1) {
    recBuffers[channel] = []
  }
}

function mergeBuffers (recBuffers, recLength) {
  const result = new Float32Array(recLength)
  let offset = 0
  for (let i = 0; i < recBuffers.length; i += 1) {
    result.set(recBuffers[i], offset)
    offset += recBuffers[i].length
  }
  return result
}

function interleave (inputL, inputR) {
  const length = inputL.length + inputR.length
  const result = new Float32Array(length)

  let index = 0
  let inputIndex = 0

  while (index < length) {
    result[index += 1] = inputL[inputIndex]
    result[index += 1] = inputR[inputIndex]
    inputIndex += 1
  }
  return result
}

function floatTo16BitPCM (output, offset, input) {
  for (let i = 0; i < input.length; i += 1, offset += 2) {
    const s = Math.max(-1, Math.min(1, input[i]))
    output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true)
  }
}

function writeString (view, offset, string) {
  for (let i = 0; i < string.length; i += 1) {
    view.setUint8(offset + i, string.charCodeAt(i))
  }
}

function encodeWAV (samples) {
  const buffer = new ArrayBuffer(44 + samples.length * 2)
  const view = new DataView(buffer)

  /* RIFF identifier */
  writeString(view, 0, 'RIFF')
  /* RIFF chunk length */
  view.setUint32(4, 36 + samples.length * 2, true)
  /* RIFF type */
  writeString(view, 8, 'WAVE')
  /* format chunk identifier */
  writeString(view, 12, 'fmt ')
  /* format chunk length */
  view.setUint32(16, 16, true)
  /* sample format (raw) */
  view.setUint16(20, 1, true)
  /* channel count */
  view.setUint16(22, numChannels, true)
  /* sample rate */
  view.setUint32(24, sampleRate, true)
  /* byte rate (sample rate * block align) */
  view.setUint32(28, sampleRate * 2 * numChannels, true)
  /* block align (channel count * bytes per sample) */
  view.setUint16(32, numChannels * 2, true)
  /* bits per sample */
  view.setUint16(34, 16, true)
  /* data chunk identifier */
  writeString(view, 36, 'data')
  /* data chunk length */
  view.setUint32(40, samples.length * 2, true)

  floatTo16BitPCM(view, 44, samples)

  return view
}
