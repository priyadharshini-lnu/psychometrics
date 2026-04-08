import consumer from '~/core/consumer'

export default class Socket {
  constructor (channel, data, opts) {
    this.channel = consumer().subscriptions.create({ channel, ...data }, {
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
    consumer().subscriptions.remove(this.channel)
  }

  unsubscribe () {}
}
