
const channels = {}

export const addListener = (channel, callback) => {
  if (!channels[channel]) {
    channels[channel] = []
  }
  channels[channel].push(callback)
}

export const removeListener = (channel, callback) => {
  if (!channels[channel]) { return }

  channels[channel] = channels[channel].filter(c => c !== callback)
}

export const sendMessage = (channel: string, message, ...args) => {
  if (!channels[channel]) { return }

  channels[channel].forEach((cb) => {
    cb(message, ...args)
  })
}
