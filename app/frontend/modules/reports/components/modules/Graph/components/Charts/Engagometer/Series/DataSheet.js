import _ from 'lodash'

export const Functions = {
}

export default {
  series (results, columns) {
    const data = (columns || []).map(col => parseFloat(results.dataSheet[col]))
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
