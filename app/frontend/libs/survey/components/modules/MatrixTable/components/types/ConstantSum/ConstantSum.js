import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import LabelEditor from 'components/LabelEditor'
import styles from './ConstantSum.scss'

export default class extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  changeLabel = (collection, i, text) => {
    const { model } = this.props
    model.changeArrayProps({ collection, i, val: text })
    this.forceUpdate()
  }

  /**
   * Render input with left|right symbol
   *
   * @param key - unique identifier
   * @returns {Object}
   * @private
   */


  changeNotApplicableLabel = (value) => {
    const { model } = this.props
    model.changeProps({ notApplicableLabel: value })
    this.forceUpdate()
  }

  renderNotApplicableHeader () {
    const { model } = this.props
    const { notApplicable, notApplicableLabel } = model.props
    if (!notApplicable) { return null }
    return (
      <LabelEditor
        onChange={this.changeNotApplicableLabel}
        maxWidth={150}
        value={notApplicableLabel}
      />
    )
  }

  renderNotApplicableCheckbox (name) {
    const { model } = this.props
    const { notApplicable } = model.props
    if (!notApplicable) { return null }
    return (
      <div>
        <input
          className={styles.input}
          type="checkbox"
          name={name}
        />
      </div>
    )
  }

  renderInput (key) {
    const { model, model: { props } } = this.props
    return (
      <div key={key}>
        {props.symbolType === 'Before' && props.symbol}
        <input
          name={`${model.name}_${key}`}
          className={`${styles.input}`}
        />
        {props.symbolType === 'After' && props.symbol}
      </div>
    )
  }

  render () {
    const { model: { props, moduleConfig } } = this.props
    return (
      <div className={styles.table}>
        <div className={`${styles.row} ${styles.header}`}>
          <div className={styles.firstColumn} />
          <div className={styles.scalePoints}>
            {_.times(props.scalePoints, i => (
              <LabelEditor
                key={i}
                onChange={e => this.changeLabel('scalePointsTexts', i, e)}
                maxWidth={150}
                value={props.scalePointsTexts[i] || moduleConfig.defaultScalePointText(i + 1)}
              />
            ))}
            {this.renderNotApplicableHeader()}
          </div>
          {props.totalBoxType === 'Statement' && (
          <div className={`${styles.totalColumn} ${styles[props.totalBoxType]}`}>
            Total
          </div>
          )}
        </div>

        {_.times(props.choices, i => (
          <div key={i} className={styles.row}>
            <div className={styles.firstColumn}>
              <div className={styles.item}>
                <LabelEditor
                  onChange={e => this.changeLabel('choicesTexts', i, e)}
                  maxWidth={150}
                  value={props.choicesTexts[i] || moduleConfig.defaultChoiceText(i + 1)}
                />
              </div>
            </div>
            <div className={styles.inputs}>
              {_.times(props.scalePoints, j => (
                this.renderInput(`${i}_${j}`)
              ))}
              {this.renderNotApplicableCheckbox()}
            </div>
            {props.totalBoxType === 'Statement' && (
            <div className={styles.totalColumn}>
              {this.renderInput(`total_${i}`)}
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
            {_.times(props.scalePoints, j => this.renderInput(`total_${j}`))}
            {props.notApplicable && <div />}
          </div>
        </div>
        )}
      </div>
    )
  }
}
