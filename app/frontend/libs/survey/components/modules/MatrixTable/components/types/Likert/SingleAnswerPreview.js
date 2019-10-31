import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import I18nStore from 'store/I18nStore'
import styles from './Likert.scss'

export default class extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  changeValue = (scale, choice, e) => {
    const { model: { result } } = this.props
    result.answer(scale, choice, e.currentTarget.checked)
    if (result.notApplicable && result.notApplicable[choice]) {
      result.notApplicable[choice] = false
    }
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
    const { notApplicable } = model.props
    if (!notApplicable) { return null }
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
      <div>
        <input
          disabled={readOnly}
          className={styles.input}
          type={answersType === 'SingleAnswer' ? 'radio' : 'checkbox'}
          onChange={e => this.changeNotApplicable(choice, e)}
          checked={checked || false}
        />
      </div>
    )
  }

  render () {
    const { model, model: { props, result, moduleConfig }, readOnly } = this.props
    return (
      <div className={styles.table}>
        <div className={`${styles.row} ${styles.labels}`}>
          <div className={styles.firstColumn} />
          <div className={styles.labelItems}>
            {_.times(props.labels, i => (
              <div key={i}>
                {props.labelsTexts[i] || moduleConfig.defaultLabelText(i + 1)}
              </div>
            ))}
          </div>
        </div>
        <div className={`${styles.row} ${styles.header}`}>
          <div className={styles.firstColumn} />
          <div className={styles.scalePoints}>
            {_.times(props.scalePoints, i => (
              <span key={i} className={styles.scalePointItem}>
                {I18nStore.tQuestion(model, `scalePointsTexts${i + 1}`, { scale: i })
                  || moduleConfig.defaultScalePointText(i + 1)}
              </span>
            ))}
            {this.renderNotApplicableHeader()}
          </div>
        </div>

        {_.times(props.choices, choice => (
          <div key={choice} className={styles.row}>
            <div className={styles.firstColumn}>
              <div className={styles.item}>
                <div key={choice}>
                  {I18nStore.tQuestion(model, `choicesTexts${choice + 1}`, { choice })
                    || moduleConfig.defaultChoiceText(choice + 1)}
                </div>
              </div>
            </div>
            <div className={styles.inputs}>
              {_.times(props.scalePoints, (scale) => {
                const object = _.find(result.answers, { scale, choice }) || {}
                return (
                  <input
                    disabled={readOnly}
                    key={scale}
                    type={props.answersType === 'SingleAnswer' ? 'radio' : 'checkbox'}
                    checked={object.value || false}
                    onChange={this.changeValue.bind(this, scale, choice)}
                    className={styles.input}
                  />
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
