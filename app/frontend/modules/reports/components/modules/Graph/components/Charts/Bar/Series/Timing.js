import _ from 'lodash'
import AppStore from 'rb/store/AppStore'

export const TYPES = {
  firstClick: 'First Click',
  lastClick: 'Last Click',
  pageSubmit: 'Page Submit',
  clickCount: 'Click Count',
}

export const Functions = {
  Count (data) {
    data = _.map(data, obj => obj[0])
    return data.length
  },

  Mean (data, key) {
    const results = _.sumBy(data, key)
    return results ? results / data.length : 0
  },
}

export default {
  series (results, question, model, func = 'Mean') {
    const colors = _.map(model.props.colors, 'color')
    if (Array.isArray(results)) {
      return _.map(results, (res, i) => {
        const commonData = _.map(TYPES, (label, key) => {
          const data = (Functions[func] || Functions.Mean)(res.results.questions[question.id], key)
          return {
            name: model.props.choicesTexts[i] || label,
            y: data,
            drilldown: label,
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
