/* eslint-disable prefer-spread */
/* eslint-disable no-underscore-dangle */
/* eslint-disable prefer-rest-params */
import { EventEmitter } from 'fbemitter'

/**
 * @param {Array} route
 * @returns {string}
 */
function routeToEventName (scope) {
  return scope.join('.')
}

class MyEventEmitter extends EventEmitter {
  __emitToSubscription (subscription) {
    const args = Array.prototype.slice.call(arguments, 2)
    subscription.listener.apply(args.shift(), args)
  }
}

const emitter = new MyEventEmitter()

const event = {

  listeners: [],

  /**
   * @param {Array} route
   * @param callback
   */
  on (scope, callback) {
    const route = routeToEventName(scope)
    this.listeners[route] = emitter.addListener(route, callback)
  },

  /**
   * @param {Array} route
   */
  off (scope) {
    const route = routeToEventName(scope)
    try {
      return this.listeners[route].remove()
    } catch (e) { console.warn(e) }
  },

  fire () {
    const a = [].slice.call(arguments)
    a[0] = routeToEventName(a[0])
    emitter.emit.apply(emitter, a)
  },
}

export default event
