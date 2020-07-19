import _ from 'lodash'

// https://gist.github.com/Daniel-Hug/7273430
export default {
  variance (array) {
    const mean = _.mean(array)
    return _.mean(array.map(num => window.Math.pow(num - mean, 2)))
  },

  standardDeviation (array) {
    return Math.sqrt(this.variance(array))
  },
}
