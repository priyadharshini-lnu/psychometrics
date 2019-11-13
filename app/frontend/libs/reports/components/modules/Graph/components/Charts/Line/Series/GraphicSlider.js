import _ from 'lodash'
import I18nStore from 'rb/store/I18nStore'
import { Functions } from '../../Base/Series/GraphicSlider'

export default {
  series (results, question, model, func = 'Count') {
    let result = []
    if (func === 'Mean') {
      result = [{
        data: [Functions[func](results.questions[question.id])],
      }]
    } else {
      const data = []
      for (let i = question.props.min; i <= question.props.max; i += 1) {
        data.push((Functions[func] || Functions.Count)(results.questions[question.id], i))
      }
      result.push({ data })
    }
    return result
  },

  xAxis (question, model, func = 'Count') {
    const labels = []
    if (func === 'Mean') {
      labels.push(I18nStore.tQuestion(question, 'questionText'))
    } else {
      for (let i = question.props.min; i <= question.props.max; i += 1) {
        labels.push(i)
      }
    }

    return {
      categories: labels,
    }
  },

  functions: _.keys(Functions),
}
