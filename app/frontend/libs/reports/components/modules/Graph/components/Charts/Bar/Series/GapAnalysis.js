import _ from 'lodash'
import AppStore from 'rb/store/AppStore'
import I18nStore from 'rb/store/I18nStore'

export const Functions = {
  Mean (data, choice) {
    let results = 0
    _.each(data, (result) => {
      const object = _.find(result, { choice })
      if (object) {
        results += object.scale + 1
      }
    })
    return results / data.length
  },
}

export default {
  series (results, question, model, func = 'Mean') {
    const colors = _.map(model.props.colors, 'color')
    if (Array.isArray(results)) {
      return _.map(results, (res, i) => {
        const commonData = _.map(question.props.choicesTexts, (label, i) => {
          label = I18nStore.tQuestion(question, `choicesTexts${i + 1}`, { choice: i })
          const data = (Functions[func] || Functions.Mean)(res.results.questions[question.id], i)
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
