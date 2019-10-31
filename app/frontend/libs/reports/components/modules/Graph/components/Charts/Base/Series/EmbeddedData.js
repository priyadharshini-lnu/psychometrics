import _ from 'lodash'

export const Functions = {
  Count (results, values) {
    return values.length
  },
  Percentile (results, values) {
    return values.length * 100 / results.length
  },
}

export default {
  series (results, embeddedData, model, func = 'Count') {
    const group = _.groupBy(results.embeddedData[embeddedData.name], data => data.value)
    const commonData = _.map(group, (value, key) => {
      const data = (Functions[func] || Functions.Count)(results.embeddedData[embeddedData.name], value)
      return {
        name: key,
        y: data,
        drilldown: embeddedData.name,
      }
    })
    return [{
      colorByPoint: true,
      data: commonData,
    }]
  },
  functions: _.keys(Functions),
}
