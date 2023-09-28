import _ from 'lodash'
import { Component } from 'react'
import PropTypes from 'prop-types'
import styles from '../../styles.less'
import { NOT_APPLICABLE } from '../../../MatrixTable/components/Consts'

class MultiSelectBoxPreview extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  changeAnswer = (e) => {
    const { model } = this.props
    if (e.currentTarget.value) {
      if (e.currentTarget.value === NOT_APPLICABLE) {
        model.result.answers = []
        model.result.notApplicable = true
        model.result.reduxAnswer()
      } else {
        model.result.notApplicable = false
        model.result.answer(parseInt(e.currentTarget.value, 10))
      }
      this.forceUpdate()
    }
  }

  renderNotApplicableOption () {
    const { model, I18n } = this.props
    const { props: { notApplicable } } = model
    if (!notApplicable) { return null }
    return (
      <option value={NOT_APPLICABLE}>{I18n.tQuestion(model, 'notApplicableLabel')}</option>
    )
  }

  render () {
    const {
      model, model: { moduleConfig, result }, readOnly, I18n,
    } = this.props

    let value = []
    if (result.answers.length) {
      value = (result.answers.map(v => v.index))
    } else if (result.notApplicable) {
      value = [NOT_APPLICABLE]
    }
    return (
      <select
        disabled={readOnly}
        multiple
        size={10}
        onChange={this.changeAnswer}
        className={styles.selectBox}
        value={value}
      >
        {_.map(model.choicesIds, i => (
          <option key={i} value={i}>
            {I18n.tQuestion(model, `choicesTexts${i + 1}`, { choice: i })
              || moduleConfig.defaultChoiceText(i + 1)}
          </option>
        ))}
        {this.renderNotApplicableOption()}
      </select>
    )
  }
}

export default MultiSelectBoxPreview
