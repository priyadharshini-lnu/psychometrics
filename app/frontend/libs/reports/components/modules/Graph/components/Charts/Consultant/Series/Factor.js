import _ from 'lodash'

export const Functions = {}

export default {
  series (results, factor, model) {
    results = results.scoring[factor.id]
    if (results && results.results) {
      const sum = _.reduce(results.results, (n, result) => result.getValue() + n, 0)
      return _.round(sum / results.results.length, model.props.numberOfDecimals)
    }
    return 0
  },
  functions: _.keys(Functions),
}
