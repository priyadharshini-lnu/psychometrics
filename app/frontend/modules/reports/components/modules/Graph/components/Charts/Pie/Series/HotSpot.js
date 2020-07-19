import _ from 'lodash'
import I18nStore from 'rb/store/I18nStore'
import { Functions, Formats, VALUES } from '../../Base/Series/HotSpot'

const LABEL_WIDTH = 60
export default {
  series (results, question, model, func = 'Count') {
    const innerWidth = model.props.position.width / (question.props.regions.length)
    return _.map(question.props.regions, (region, index) => {
      const data = []
      _.forOwn(VALUES, (value, type) => {
        data.push({
          name: type,
          y: Functions[func](results.questions[question.id], index, value),
        })
      })
      return {
        type: 'pie',
        data,
        size: '75%',
        center: [`${index * innerWidth + innerWidth / 2 - LABEL_WIDTH / 2}px`, '50%'],
        showInLegend: index === 0,
      }
    })
  },

  format (func = 'Count') {
    return Formats[func]
  },

  labels (question, model) {
    const innerWidth = model.props.position.width / (question.props.regions.length)
    return _.map(question.props.regions, (region, index) => ({
      html: I18nStore.tQuestion(question, `regionsNames${index + 1}`, { region: index }),
      style: {
        left: `${index * innerWidth + innerWidth / 2 - LABEL_WIDTH / 2}px`,
        top: '5px',
        width: `${LABEL_WIDTH}px`,
        color: model.props.style.fontColor || '#000',
        fontSize: model.props.style.fontSize || '11px',
        fontFamily: model.props.style.fontFamily,
      },
    }))
  },

  hasLegend: true,

  functions: _.keys(Functions),
}
