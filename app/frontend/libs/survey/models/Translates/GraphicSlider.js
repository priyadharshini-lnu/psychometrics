import BaseTranslate from './BaseTranslate'

class GraphicSlider extends BaseTranslate {
  getValueByCode (field) {
    return this.question.props[field]
  }

  exportLocales = () => ({
    questionText: this.question.props.questionText,
    labelLow: this.question.props.labelLow,
    labelHigh: this.question.props.labelHigh,
  })
}

export default GraphicSlider
