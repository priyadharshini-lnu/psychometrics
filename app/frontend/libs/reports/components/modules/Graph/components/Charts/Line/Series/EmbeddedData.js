import _ from 'lodash'
import { Functions } from '../../Base/Series/EmbeddedData'

export default {
  series (results, embeddedData, model, func = 'Count') {
    const group = _.groupBy(results.embeddedData[embeddedData.name], data => data.value)
    const data = _.map(group, value => Functions[func](results, value))
    return [{
      data,
    }]
  },

  // eslint-disable-next-line no-unused-vars
  xAxis (question, embeddedData, func = 'Count', results) {
    const keys = _.keys(_.groupBy(results.embeddedData[question.name], data => data.value))
    const labels = _.map(keys, (key, i) => embeddedData.props.choicesTexts[i] || key)
    return {
      categories: labels,
    }
  },

  functions: _.keys(Functions),
}
