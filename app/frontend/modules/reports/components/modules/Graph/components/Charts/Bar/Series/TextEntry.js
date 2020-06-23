import _ from 'lodash'
import AppStore from 'rb/store/AppStore'
import I18nStore from 'rb/store/I18nStore'

export const Functions = {
  Count (data) {
    return data.length
  },
}
export default {
  series (results, question, model, func = 'Count') {
    const colors = _.map(model.props.colors, 'color')
    if (Array.isArray(results)) {
      return _.map(results, (res, i) => {
        func = Functions[func] ? Functions[func] : Functions.Count
        const data = func(res.results.questions[question.id])
        return {
          name: res.desc || AppStore.report.getFilterNameById(res.filterId),
          color: colors[i],
          data: [{
            name: I18nStore.tQuestion(question, 'questionText'),
            y: data,
            drilldown: 'Count',
          }],
        }
      })
    }
    throw new Error('Bar chart supports multiple choices. See ResultManager to build correct array of results')
  },
  hasLegend: true,
  functions: _.keys(Functions),
}
