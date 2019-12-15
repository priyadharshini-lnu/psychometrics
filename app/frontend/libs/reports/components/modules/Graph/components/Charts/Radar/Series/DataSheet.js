import _ from 'lodash'
import ResultStore from 'rb/store/ResultStore'
import { getFilterName } from './Factor'

export const Functions = {}

export default {
  series (results, columns, model) {
    return results.map((result, i) => {
      let data = (columns || []).map(col => _.meanBy(result.results.groupedDataSheet, d => parseFloat(d[col]) || 0))
      if (!ResultStore.realResults) {
        data = data.map(d => d - (i / 2)).map((d) => {
          if (d > model.props.radarMax) return model.props.radarMax
          return d
        })
      }
      return {
        data,
        name: result.desc || getFilterName(result.filterId),
      }
    })
  },
  functions: _.keys(Functions),
}
