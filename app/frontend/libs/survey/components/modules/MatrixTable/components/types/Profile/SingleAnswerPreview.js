import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import I18nStore from 'store/I18nStore'
import styles from './Profile.scss'

export default class extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  changeValue = (scale, choice, e) => {
    const { model: { result } } = this.props
    if (result.notApplicable && result.notApplicable[choice]) {
      result.notApplicable[choice] = false
    }
    result.answer(scale, choice, e.currentTarget.checked)
    this.forceUpdate()
  }

  changeNotApplicable = (choice) => {
    const { model: { result } } = this.props
    _.remove(result.answers, { choice })
    result.notApplicable = result.notApplicable || {}
    result.notApplicable[choice] = true
    this.forceUpdate()
  }

  renderNotApplicableHeader () {
    const { model } = this.props
    return (
      <span className={styles.scalePointItem}>{I18nStore.tQuestion(model, 'notApplicableLabel')}</span>
    )
  }

  renderNotApplicableCheckbox (choice) {
    const { model, readOnly } = this.props
    const { props: { notApplicable, answersType }, result } = model
    if (!notApplicable) { return null }
    const checked = result.notApplicable && result.notApplicable[choice]
    return (
      <label className={styles.inputGroup}>
        <div>{this.renderNotApplicableHeader()}</div>
        <input
          disabled={readOnly}
          className={styles.input}
          type={answersType === 'SingleAnswer' ? 'radio' : 'checkbox'}
          onChange={this.changeNotApplicable.bind(this, choice)}
          checked={checked || false}
        />
      </label>
    )
  }

  render () {
    const { model, model: { props, moduleConfig, result }, readOnly } = this.props
    return (
      <div className={styles.table}>
        {_.times(props.choices, choice => (
          <div key={choice} className={styles.row}>
            <div className={styles.firstColumn}>
              <div className={styles.item}>
                <span>
                  {I18nStore.tQuestion(model, `choicesTexts${choice + 1}`, { choice })
                    || moduleConfig.defaultChoiceText(choice + 1)}
                </span>
              </div>
            </div>
            <div className={styles.inputs}>
              {_.times(props.scalePoints, (scale) => {
                const object = _.find(result.answers, { scale, choice }) || {}
                return (
                  <label key={scale} className={styles.inputGroup}>
                    <div>
                      {I18nStore.tQuestion(model, `scalePointsTexts${scale + 1}`, { scale })
                        || moduleConfig.defaultScalePointText(scale + 1)}
                    </div>
                    <input
                      key={scale}
                      disabled={readOnly}
                      checked={object.value || false}
                      onChange={e => this.changeValue(scale, choice, e)}
                      type={props.answersType === 'SingleAnswer' ? 'radio' : 'checkbox'}
                      className={styles.input}
                    />
                  </label>
                )
              })}
              {this.renderNotApplicableCheckbox(choice)}
            </div>
          </div>
        ))}
      </div>
    )
  }
}
