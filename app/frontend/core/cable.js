import createConsumer from './consumer'

export default class Socket {
  constructor (channel, data, opts) {
    this.channel = createConsumer().subscriptions.create({ channel, ...data }, {
      connected () {
        opts.onConnect()
      },
      disconnected () {
        opts.onDisconnect()
      },
      received (data) {
        opts.onReceived(data)
      },
    })
  }

  remove () {
    createConsumer().subscriptions.remove(this.channel)
  }

  unsubscribe () {}
}
