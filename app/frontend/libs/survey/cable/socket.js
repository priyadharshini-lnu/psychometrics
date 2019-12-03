const { App } = window

export default class Socket {
  constructor (channel, data, opts) {
    this.channel = App.cable.subscriptions.create({ channel, ...data }, {
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
    App.cable.subscriptions.remove(this.channel)
  }

  unsubscribe () {}
}
