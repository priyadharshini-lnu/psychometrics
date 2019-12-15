import _ from 'lodash'
import v4 from 'uuid/v4'

export default {
  limit (val, min = 0, max = 300) {
    val = val > min ? val : min
    val = val < max ? val : max
    return val
  },
  round (val, precision = 1) {
    if (!val) return 0
    return Math.round(val * (10 ** precision)) / (10 ** precision)
  },

  parseFloat (str) {
    if (str.slice(-1) === '.') {
      return parseFloat(str) ? `${parseFloat(str)}.` : `${0}.`
    }
    return parseFloat(str)
  },

  rand (min = 0, max = 100) {
    return Math.floor(Math.random() * (max - min + 1) + min)
  },

  randReal (min = 0, max = 100, precision = 2) {
    return Math.floor((10 ** precision) * (Math.random() * (max - min + 1) + min)) / (10 ** precision)
  },

  findKeyWhere (obj, value) {
    let key = []

    _.find(obj, (v, k) => {
      if (v === value) {
        key = k
      }
    })

    return key
  },

  stripHTML (dirtyString) {
    dirtyString = _.unescape(dirtyString)
    dirtyString = dirtyString.replace(/<\/?[^>]+(>|$)|\\n|&nbsp;/g, '')
    return _.trim(dirtyString)
  },

  toSnakeCase (str) {
    return str.replace(/\.?([A-Z])/g, (x, y) => `_${y.toLowerCase()}`).replace(/^_/, '')
  },

  genId () {
    return v4()
  },

  convertHex (hex, opacity) {
    hex = hex.replace('#', '')
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)

    return `rgba(${r},${g},${b},${opacity / 100})`
  },
}
