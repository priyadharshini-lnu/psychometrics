import _ from 'lodash'
import AppStore from 'rb/store/AppStore'

export const Functions = {
}

export default {
  series (results, factors, model) {
    const colors = _.map(model.props.colors, 'color')
    return results.map((res, i) => {
      const data = (model.props.source.columns || []).map(column => ({
        name: column,
        y: parseFloat(res.results.dataSheet[column]),
      }))
      return {
        name: res.desc || AppStore.report.getFilterNameById(res.filterId),
        color: colors[i],
        data,
      }
    })
  },
  hasLegend: true,
  functions: _.keys(Functions),
}
