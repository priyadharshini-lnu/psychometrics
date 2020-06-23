import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import LabelEditor from 'components/LabelEditor'
import styles from './Choice.scss'

export default class extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  changeLabel = (collection, i, text) => {
    const { model } = this.props
    collection[i] = text
    model.update()
    this.forceUpdate()
  }

  changeValue = () => {}

  renderInput (key) {
    const { model, model: { props } } = this.props
    return (
      <div key={key}>
        {props.symbolType === 'Before' && props.symbol}
        <input
          name={`${model.name}_${key}`}
          defaultValue="0"
          className={`${styles.input}`}
          onChange={this.changeValue}
        />
        {props.symbolType === 'After' && props.symbol}
      </div>
    )
  }

  renderHorizontal () {
    const { model: { props, moduleConfig } } = this.props
    return (
      <div className={styles.horizontalTable}>
        {_.times(props.choices, i => (
          <div key={i} className={styles.horizontalContainer}>
            <div>
              {this.renderInput(i)}
            </div>
            <div>
              <LabelEditor
                onChange={e => this.changeLabel(props.choicesTexts, i, e)}
                maxWidth={150}
                value={props.choicesTexts[i] || moduleConfig.defaultChoiceText(i + 1)}
              />
            </div>
          </div>
        ))}
      </div>
    )
  }

  renderVertical () {
    const { model, model: { props, moduleConfig } } = this.props
    return (
      <div className={styles.table}>
        {_.times(props.choices, i => (
          <div key={i} className={styles.row}>
            <div className={styles.firstColumn}>
              <LabelEditor
                onChange={e => this.changeLabel(props.choicesTexts, i, e)}
                maxWidth={150}
                value={props.choicesTexts[i] || moduleConfig.defaultChoiceText(i + 1)}
              />
            </div>
            <div className={styles.lastColumn}>
              {this.renderInput(i)}
            </div>
          </div>
        ))}
        {model.hasOption('Total Box') && (
          <div className={`${styles.row} ${styles.totalRow}`}>
            <div className={styles.firstColumn}>Total</div>
            <div className={styles.lastColumn}>
              {this.renderInput('total')}
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
