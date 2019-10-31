import _ from 'lodash'

export const Functions = {
}

export default {
  series (results, factor) {
    results = results.scoring[factor.id]
    if (results && results.results) {
      const sum = _.reduce(results.results, (n, result) => result.getValue() + n, 0)
      return sum / results.results.length
    }
    return 0
  },
  functions: _.keys(Functions),
}
