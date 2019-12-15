import _ from 'lodash'
import AppStore from 'rb/store/AppStore'
import I18nStore from 'rb/store/I18nStore'

export const Functions = {
  Count (data, index) {
    return _.filter(_.map(data, obj => obj[0]), { value: index }).length
  },

  Percentile (data, index) {
    return _.filter(_.map(data, obj => obj[0]), { value: index }).length * 100 / data.length
  },

  Mean (data) {
    const sum = _.reduce(_.map(data, obj => obj[0]), (n, result) => result.value + n, 0)
    return sum / data.length
  },
}

export default {
  series (results, question, model, func = 'Count') {
    const colors = _.map(model.props.colors, 'color')
    if (Array.isArray(results)) {
      return _.map(results, (res, i) => {
        const commonData = []
        if (func === 'Mean') {
          commonData.push({
            name: I18nStore.tQuestion(question, 'questionText'),
            y: (Functions[func] || Functions.Count)(res.results.questions[question.id]),
            drilldown: question.props.questionText,
          })
        } else {
          for (let i = question.props.min; i <= question.props.max; i += 1) {
            const data = (Functions[func] || Functions.Count)(res.results.questions[question.id], i)
            commonData.push({
              name: i,
              y: data,
              drilldown: i,
            })
          }
        }
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
