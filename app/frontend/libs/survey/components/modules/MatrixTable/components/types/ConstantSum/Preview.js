import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import I18nStore from 'store/I18nStore'
import styles from './ConstantSum.scss'

export default class extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  /**
   * Render input with left|right symbol
   *
   * @param x - coordinate x in matrix
   * @param y - coordinate y in matrix
   * @param type - Possible values: base, total
   * @returns {Object}
   * @private
   */


  changeNotApplicable = (choice) => {
    const { model: { result } } = this.props
    _.remove(result.answers, { choice })
    result.notApplicable = result.notApplicable || {}
    result.notApplicable[choice] = true
    this.forceUpdate()
  }

  changeValue = (scale, choice, e) => {
    const { model: { result } } = this.props
    if (result.notApplicable && result.notApplicable[choice]) {
      result.notApplicable[choice] = false
    }
    result.answer(scale, choice, e.currentTarget.value)
    this.forceUpdate()
  }

  calcTotal (x, y) {
    const { model, model: { props } } = this.props
    let result = 0
    if (props.totalBoxType === 'Statement') {
      _.times(props.scalePoints, (x) => {
        const object = _.find(model.result.answers, { scale: x, choice: y }) || {}
        result += parseFloat(object.value) || 0
      })
    }
    if (props.totalBoxType === 'Scale Point') {
      _.times(props.choices, (y) => {
        const object = _.find(model.result.answers, { scale: x, choice: y }) || {}
        result += parseFloat(object.value) || 0
      })
    }
    return result
  }

  renderNotApplicableCheckbox (choice) {
    const { model: { props: { notApplicable }, result } } = this.props
    if (!notApplicable) { return null }
    const checked = result.notApplicable && result.notApplicable[choice]
    return (
      <div>
        <input
          className={styles.input}
          type="checkbox"
          onChange={e => this.changeNotApplicable(choice, e)}
          checked={checked || false}
        />
      </div>
    )
  }

  renderNotApplicableHeader () {
    const { model } = this.props
    const { notApplicable } = model.props
    if (!notApplicable) { return null }
    return (
      <span className={styles.scalePointItem}>{I18nStore.tQuestion(model, 'notApplicableLabel')}</span>
    )
  }

  renderInput (x = '', y = '', type = 'base') {
    const { model, model: { props }, readOnly } = this.props
    const inputProps = {
      name: `${model.name}_${type}_${x}_${y}`,
      className: styles.input,
    }
    if (type === 'base') {
      inputProps.onChange = this.changeValue.bind(this, x, y)
    }
    inputProps.readOnly = readOnly
    if (type === 'total') {
      inputProps.readOnly = true
    }
    const object = _.find(model.result.answers, { scale: x, choice: y }) || {}
    inputProps.value = type === 'total' ? this.calcTotal(x, y) : object.value || 0
    return (
      <div key={`${x}_${y}`}>
        {props.symbolType === 'Before' && props.symbol}
        <input {...inputProps} />
        {props.symbolType === 'After' && props.symbol}
      </div>
    )
  }

  render () {
    const { model, model: { props, moduleConfig } } = this.props
    return (
      <div className={styles.table}>
        <div className={`${styles.row} ${styles.header}`}>
          <div className={styles.firstColumn} />
          <div className={styles.scalePoints}>
            {_.times(props.scalePoints, i => (
              <div key={i}>
                {I18nStore.tQuestion(model, `scalePointsTexts${i + 1}`, { scale: i })
                  || moduleConfig.defaultScalePointText(i + 1)}
              </div>
            ))}
            {this.renderNotApplicableHeader()}
          </div>
          {props.totalBoxType === 'Statement' && (
          <div className={`${styles.totalColumn} ${styles[props.totalBoxType]}`}>
            Total
          </div>
          )}
        </div>

        {_.times(props.choices, choice => (
          <div key={choice} className={styles.row}>
            <div className={styles.firstColumn}>
              <div className={styles.item}>
                <div>
                  {I18nStore.tQuestion(model, `choicesTexts${choice + 1}`, { choice })
                    || moduleConfig.defaultChoiceText(choice + 1)}
                </div>
              </div>
            </div>
            <div className={styles.inputs}>
              {_.times(props.scalePoints, scale => (
                this.renderInput(scale, choice)
              ))}
              {this.renderNotApplicableCheckbox(choice)}
            </div>
            {props.totalBoxType === 'Statement' && (
            <div className={styles.totalColumn}>
              {this.renderInput(null, choice, 'total')}
            </div>
            )}
          </div>
        ))}
        {props.totalBoxType === 'Scale Point' && (
        <div className={`${styles.row} ${styles.totalRow}`}>
          <div className={styles.firstColumn}>
            Total
          </div>
          <div className={styles.inputs}>
            {_.times(props.scalePoints, j => (
              this.renderInput(j, null, 'total')
            ))}
            {props.notApplicable && <div className={styles.input} />}
          </div>
        </div>
        )}
      </div>
    )
  }
}
