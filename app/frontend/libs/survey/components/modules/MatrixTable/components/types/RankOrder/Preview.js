import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import I18nStore from 'store/I18nStore'
import styles from './RankOrder.scss'

export default class extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  changeValue = (scale, choice, e) => {
    const { model: { result } } = this.props

    if (result.notApplicable && result.notApplicable[choice]) {
      result.notApplicable[choice] = false
    }
    result.answer(scale, choice, e.currentTarget.value)
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
      <span className={styles.labelItem}>{I18nStore.tQuestion(model, 'notApplicableLabel')}</span>
    )
  }

  renderNotApplicableCheckbox (choice) {
    const { model: { props: { notApplicable }, result }, readOnly } = this.props
    if (!notApplicable) { return null }
    const checked = result.notApplicable && result.notApplicable[choice]
    return (
      <div>
        <input
          disabled={readOnly}
          className={styles.input}
          type="checkbox"
          onChange={e => this.changeNotApplicable(choice, e)}
          checked={checked || false}
        />
      </div>
    )
  }

  render () {
    const { model, model: { props, moduleConfig, result }, readOnly } = this.props
    return (
      <div className={styles.table}>
        <div className={`${styles.row} ${styles.header}`}>
          <div className={styles.firstColumn} />
          {_.times(props.scalePoints, i => (
            <span className={styles.labelItem} key={i}>
              {I18nStore.tQuestion(model, `scalePointsTexts${i + 1}`, { scale: i })
                || moduleConfig.defaultScalePointText(i + 1)}
            </span>
          ))}
          {this.renderNotApplicableHeader()}
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
                    value={object.value || ''}
                    onChange={this.changeValue.bind(this, scale, choice)}
                    className={`${styles.input} ${styles[props.textEntrySize]}`}
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
