import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import cs from 'classnames'
import styles from '../../styles.less'
import { NOT_APPLICABLE } from '../../../MatrixTable/components/Consts'

class DropdownPreview extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  changeAnswer = (e) => {
    const { model } = this.props
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

  isNeedToChangeDirectionInDropDown () {
    const { model, I18n } = this.props
    model.isAnyArabicTranslateExist = false
    _.each(model.choicesIds, (i) => {
      I18n.tQuestion(model, `choicesTexts${i + 1}`, { choice: i })
    })
    return !model.isAnyArabicTranslateExist
  }

  renderNotApplicableOption () {
    const { model, I18n } = this.props
    const { notApplicable } = model.props
    if (!notApplicable) { return null }
    return (
      <option value={NOT_APPLICABLE}>{I18n.tQuestion(model, 'notApplicableLabel')}</option>
    )
  }

  render () {
    const {
      model, model: { moduleConfig, result }, readOnly, I18n,
    } = this.props
    let previewWithLtr = styles.select_box || ''
    const value = _.get(result, ['answers', 0, 'index'], (result.notApplicable && NOT_APPLICABLE))
    if (result.question.isNeedToAddLtrManually) {
      if (previewWithLtr.indexOf('ltr_direction') === -1) {
        previewWithLtr += ` ${styles.left_float}`
      }
    }
    if (this.isNeedToChangeDirectionInDropDown()) {
      previewWithLtr += ` ${styles.ltr_direction}`
      model.isAnyArabicTranslateExist = false
    }
    return (
      <div>
        <select
          disabled={readOnly}
          className={cs(previewWithLtr, 'custom-select')}
          onChange={this.changeAnswer}
          value={`${value}` || ''}
        >
          <option value="" />
          {_.map(model.choicesIds, i => (
            <option key={i} value={i}>
              {I18n.tQuestion(model, `choicesTexts${i + 1}`, { choice: i })
                || moduleConfig.defaultChoiceText(i + 1)}
            </option>
          ))}
          {this.renderNotApplicableOption()}
        </select>
      </div>
    )
  }
}

export default DropdownPreview
