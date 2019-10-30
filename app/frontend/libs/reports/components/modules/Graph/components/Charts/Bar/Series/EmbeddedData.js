import _ from 'lodash'
import AppStore from 'rb/store/AppStore'

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
    const colors = _.map(model.props.colors, 'color')
    // find pull of possible values
    const values = {}
    if (Array.isArray(results)) {
      _.each(results, (res) => {
        _.each(res.results.embeddedData[embeddedData.name], (obj) => {
          values[obj.value] = null
        })
      })
      return _.map(results, (res, i) => {
        const group = _.groupBy(res.results.embeddedData[embeddedData.name], data => data.value)
        // if current filter does not contains all values, we need to fill it zero values
        _.each(values, (val, key) => {
          if (!group[key]) {
            group[key] = []
          }
        })
        const commonData = _.map(group, (value, key) => {
          const data = (Functions[func] || Functions.Count)(res.results.embeddedData[embeddedData.name], value)
          return {
            name: key,
            y: data,
            drilldown: embeddedData.name,
          }
        })
        return {
          name: res.desc || AppStore.report.getFilterNameById(res.filterId),
          color: colors[i],
          data: commonData,
        }
      })
    }
    throw new Error('Bar chart supports multiple choices. See ResultManager to build correct array of results')
  },
  hasLegend: true,
  functions: _.keys(Functions),
}
