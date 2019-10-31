import _ from 'lodash'
import I18nStore from 'rb/store/I18nStore'
import { Functions } from '../../Base/Series/MatrixTable'

const LABEL_WIDTH = 60
export default {
  series (results, question, model, func = 'Count') {
    const innerWidth = model.props.position.width / question.props.choices
    return _.map(question.props.scalePointsTexts, (labelScalePoint, indexScalePoint) => {
      const data = _.map(question.props.choicesTexts, (labelChoice, indexChoice) => {
        labelChoice = I18nStore.tQuestion(question, `choicesTexts${indexChoice + 1}`, { choice: indexChoice })
        return {
          name: model.props.choicesTexts[indexChoice] || labelChoice,
          y: (Functions[func] || Functions.Count)(results.questions[question.id], indexChoice, indexScalePoint),
        }
      })
      return {
        type: 'pie',
        data,
        size: '75%',
        center: [`${indexScalePoint * innerWidth + innerWidth / 2 - LABEL_WIDTH / 2}px`, '50%'],
        showInLegend: indexScalePoint === 0,
      }
    })
  },

  labels (question, model) {
    const innerWidth = model.props.position.width / question.props.choices
    return _.map(question.props.scalePointsTexts, (labelScalePoint, index) => {
      labelScalePoint = I18nStore.tQuestion(question, `scalePointsTexts${index + 1}`, { scale: index })
      return {
        html: labelScalePoint,
        style: {
          left: `${index * innerWidth + innerWidth / 2 - LABEL_WIDTH / 2}px`,
          top: '5px',
          width: `${LABEL_WIDTH}px`,
          color: model.props.style.fontColor || '#000',
          fontSize: model.props.style.fontSize || '11px',
          fontFamily: model.props.style.fontFamily,
        },
      }
    })
  },

  hasLegend: true,

  functions: _.keys(Functions),
}
