import _ from 'lodash'

export const Functions = {
}

export default {
  series (results, factors) {
    const data = _.map(factors, (factor) => {
      const factorResults = results.scoring[factor.id]
      if (factorResults && factorResults.results) {
        const sum = _.reduce(factorResults.results, (n, result) => result.getValue() + n, 0)
        return sum / factorResults.results.length
      }
      return 0
    })
    const total = _.sum(data)
    let currentValue = 0
    return _.map(data, (obj) => {
      const res = {
        from: currentValue,
        to: currentValue + _.round(obj * 100 / total, 1),
      }
      currentValue = res.to
      return res
    })
  },
  functions: _.keys(Functions),
}
