import _ from 'lodash'

const { $ } = window

export default {
  limit (val, min = 0, max = 300) {
    let value = val > min ? val : min
    value = val < max ? val : max
    return value
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

  getJsonFromUrl () {
    const query = location.search.substr(1)
    const result = {}
    query.split('&').forEach((part) => {
      const item = part.split('=')
      result[item[0]] = decodeURIComponent(item[1])
    })
    return result
  },

  defaultTo (value, ...args) {
    return _.defaultTo(value, _.find(args, x => (_.isNumber(x) ? true : _.defaultTo(value, x))))
  },

  scroll (hash) {
    $('html,body').animate({ scrollTop: $(`[name="${hash}"]`).offset().top - 70 }, 200)
  },
}
