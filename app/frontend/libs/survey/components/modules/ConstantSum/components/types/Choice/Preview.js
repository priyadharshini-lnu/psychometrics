import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Utils from 'utils/Utils'
import I18nStore from 'store/I18nStore'
import styles from './Choice.scss'

export default class extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  changeValue = (i, e) => {
    const { model, readOnly } = this.props
    if (readOnly) { return }
    model.result.answer(i, Utils.parseFloat(e.currentTarget.value))
    this.forceUpdate()
  }

  calcTotal () {
    let result = 0
    const { model } = this.props
    _.each(model.result.answers, (answer) => {
      const value = parseFloat(answer.value)
      if (value) {
        result += value
      }
    })
    return result
  }

  renderInput (key, type = 'base', index = null) {
    const { model, model: { props } } = this.props
    return (
      <div key={key}>
        {props.symbolType === 'Before' && props.symbol}
        <input
          value={type === 'base' ? key.value || 0 : this.calcTotal()}
          name={`${model.name}_${index}`}
          className={`${styles.input}`}
          onChange={e => this.changeValue(index, e)}
        />
        {props.symbolType === 'After' && props.symbol}
      </div>
    )
  }

  renderHorizontal () {
    const { model, model: { result, moduleConfig } } = this.props
    return (
      <div className={styles.horizontalTable}>
        {_.map(model.choicesIds, (i) => {
          const object = _.find(result.answers, { index: i }) || {}
          return (
            <div key={i} className={styles.horizontalContainer}>
              <div>
                {this.renderInput(object, 'base', i)}
              </div>
              <div>
                <span>
                  {I18nStore.tQuestion(model, `choicesTexts${i + 1}`, { choice: i })
                    || moduleConfig.defaultChoiceText(i + 1)}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  renderVertical () {
    const { model, model: { result, moduleConfig } } = this.props
    return (
      <div className={styles.table}>
        {_.map(model.choicesIds, (i) => {
          const object = _.find(result.answers, { index: i }) || {}
          return (
            <div key={i} className={styles.row}>
              <div className={styles.firstColumn}>
                <span>
                  {I18nStore.tQuestion(model, `choicesTexts${i + 1}`, { choice: i })
                    || moduleConfig.defaultChoiceText(i + 1)}
                </span>
              </div>
              <div className={styles.lastColumn}>
                {this.renderInput(object, 'base', i)}
              </div>
            </div>
          )
        })}
        {model.hasOption('Total Box') && (
          <div className={`${styles.row} ${styles.totalRow}`}>
            <div className={styles.firstColumn}>Total</div>
            <div className={styles.lastColumn}>
              {this.renderInput(null, 'total')}
            </div>
          </div>
        )}
      </div>
    )
  }

  render () {
    const { model } = this.props
    return (
      model.props.position === 'Vertical' ? this.renderVertical() : this.renderHorizontal()
    )
  }
}
