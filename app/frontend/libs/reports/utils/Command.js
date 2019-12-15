export default class Command {
  static run (...args) {
    const instance = new this(...args)
    return instance.run()
  }
}
