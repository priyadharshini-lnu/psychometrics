import _ from 'lodash'
import ResultStore from 'rb/store/ResultStore'

export const Functions = {}

export default {
  series (results, factor) {
    if (ResultStore.realResults) {
      results = results.scoring[factor.id]
    } else {
      results = results.scoring[factor.parent_id]
    }
    if (results && results.results) {
      const sum = _.reduce(results.results, (n, result) => result.getValue() + n, 0)
      return sum / results.results.length
    }
    return 0
  },
  functions: _.keys(Functions),
}
