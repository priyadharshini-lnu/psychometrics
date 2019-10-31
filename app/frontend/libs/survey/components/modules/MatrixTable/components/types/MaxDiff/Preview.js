import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import I18nStore from 'store/I18nStore'
import styles from './MaxDiff.scss'

export default class extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  changeValue = (scale, choice) => {
    const { model: { result } } = this.props
    if (result.notApplicable && result.notApplicable[choice]) {
      result.notApplicable[choice] = false
    }
    result.answer(scale, choice)
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
      <div className={`${styles.column} ${styles.notApplicable}`}>
        <span className={styles.scalePointItem}>{I18nStore.tQuestion(model, 'notApplicableLabel')}</span>
      </div>
    )
  }

  renderNotApplicableCheckbox (choice) {
    const { model: { props: { notApplicable }, result }, readOnly } = this.props
    if (!notApplicable) { return null }
    const checked = result.notApplicable && result.notApplicable[choice]
    return (
      <div className={styles.option}>
        <input
          disabled={readOnly}
          className={styles.input}
          type="radio"
          onChange={this.changeNotApplicable.bind(this, choice)}
          checked={checked || false}
        />
      </div>
    )
  }

  render () {
    const { model, model: { props, result, moduleConfig }, readOnly } = this.props
    return (
      <div className={styles.table}>
        <div className={`${styles.row} ${styles.header}`}>
          <div className={`${styles.column} ${styles.firstColumn}`}>
            <span className={styles.item}>
              {I18nStore.tQuestion(model, `scalePointsTexts${1}`, { scale: 0 })
                || moduleConfig.defaultScalePointText(1)}
            </span>
          </div>
          <div className={`${styles.choice} ${styles.choiceHeader}`}>
            {props.notApplicable && this.renderNotApplicableHeader()}
          </div>
          <div className={`${styles.column} ${styles.lastColumn}`}>
            <span className={styles.item}>
              {I18nStore.tQuestion(model, `scalePointsTexts${2}`, { scale: 1 })
                || moduleConfig.defaultScalePointText(2)}
            </span>
          </div>
        </div>

        {_.times(props.choices, (choice) => {
          const firstAnswer = _.find(result.answers, { scale: 0, choice }) || {}
          const lastResult = _.find(result.answers, { scale: 1, choice }) || {}
          return (
            <div key={choice} className={styles.row}>
              <div className={`${styles.column} ${styles.firstColumn}`}>
                <input
                  disabled={readOnly}
                  checked={!!firstAnswer.value}
                  onChange={this.changeValue.bind(this, 0, choice)}
                  type="radio"
                  className={styles.input}
                />
              </div>
              <div className={`${styles.choice} ${styles.choiceNotApplicable}`}>
                <span className={styles.item}>
                  {I18nStore.tQuestion(model, `choicesTexts${choice + 1}`, { choice })
                    || moduleConfig.defaultChoiceText(choice + 1)}
                </span>
                {this.renderNotApplicableCheckbox(choice)}
              </div>
              <div className={`${styles.column} ${styles.lastColumn}`}>
                <input
                  disabled={readOnly}
                  checked={!!lastResult.value}
                  onChange={this.changeValue.bind(this, 1, choice)}
                  type="radio"
                  className={styles.input}
                />
              </div>
            </div>
          )
        })}
      </div>
    )
  }
}
