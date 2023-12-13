import _ from 'lodash'

export const Functions = {
}

export default {
  series (results, codes) {
    const data = (codes || []).map(code => parseFloat(_.find(results.campaignFactorResults, { code })?.value, 10))
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
