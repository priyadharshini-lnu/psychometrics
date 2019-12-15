import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import cs from 'classnames'
import I18nStore from 'store/I18nStore'
import styles from '../MultipleChoice.scss'
import { NOT_APPLICABLE } from '../../../MatrixTable/components/Consts'

export default class extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  changeAnswer = (e) => {
    const { model } = this.props
    if (e.currentTarget.value === NOT_APPLICABLE) {
      model.result.answers = []
      model.result.notApplicable = true
    } else {
      model.result.answer(parseInt(e.currentTarget.value, 10))
      model.result.notApplicable = false
    }
    this.forceUpdate()
  }

  isNeedToChangeDirectionInDropDown () {
    const { model } = this.props
    model.isAnyArabicTranslateExist = false
    _.each(model.choicesIds, (i) => {
      I18nStore.tQuestion(model, `choicesTexts${i + 1}`, { choice: i })
    })
    return !model.isAnyArabicTranslateExist
  }

  renderNotApplicableOption () {
    const { model } = this.props
    const { notApplicable } = model.props
    if (!notApplicable) { return null }
    return (
      <option value={NOT_APPLICABLE}>{I18nStore.tQuestion(model, 'notApplicableLabel')}</option>
    )
  }

  render () {
    const { model, model: { moduleConfig, result }, readOnly } = this.props
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
              {I18nStore.tQuestion(model, `choicesTexts${i + 1}`, { choice: i })
                || moduleConfig.defaultChoiceText(i + 1)}
            </option>
          ))}
;
          {this.renderNotApplicableOption()}
        </select>
      </div>
    )
  }
}
