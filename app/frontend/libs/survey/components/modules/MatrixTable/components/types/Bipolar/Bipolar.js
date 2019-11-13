import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import LabelEditor from 'components/LabelEditor'
import styles from './Bipolar.scss'

export default class extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  update = () => {
    const { model } = this.props
    model.update()
    this.forceUpdate()
  }

  changeLabel = (collection, i, text) => {
    const { model } = this.props
    model.changeArrayProps({ collection, i, val: text })
  }

  changeLeftChoice = (collection, i, text) => {
    const { model } = this.props
    const item = model.props[collection][i]
    text = `${text}:${item.split(':')[1] || 'Right'}`
    model.changeArrayProps({ collection, i, val: text })
  }

  changeRightChoice = (collection, i, text) => {
    const { model } = this.props
    const item = model.props[collection][i]
    text = `${item.split(':')[0]}:${text}`
    model.changeArrayProps({ collection, i, val: text })
  }

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
    const { notApplicable, answersType } = model.props
    if (!notApplicable) { return null }
    return (
      <div>
        <input
          className={styles.input}
          type={answersType === 'SingleAnswer' ? 'radio' : 'checkbox'}
          name={name}
        />
      </div>
    )
  }

  render () {
    const { model, model: { props, moduleConfig } } = this.props

    return (
      <div className={styles.table}>
        <div className={`${styles.row} ${styles.labels}`}>
          <div className={styles.firstColumn} />
          <div className={styles.labelItems}>
            {_.times(props.labels, i => (
              <LabelEditor
                key={i}
                onChange={e => this.changeLabel('labelsTexts', i, e)}
                maxWidth={150}
                value={props.labelsTexts[i] || moduleConfig.defaultLabelText(i + 1)}
              />
            ))}
          </div>
          <div className={styles.lastColumn} />
        </div>
        <div className={`${styles.row} ${styles.header}`}>
          <div className={styles.firstColumn} />
          {_.times(props.scalePoints, i => (
            <LabelEditor
              key={i}
              onChange={e => this.changeLabel('scalePointsTexts', i, e)}
              maxWidth={150}
              value={props.scalePointsTexts[i] || moduleConfig.defaultScalePointText(i + 1)}
            />
          ))}
          {this.renderNotApplicableHeader()}
          <div className={styles.lastColumn} />
        </div>

        {_.times(props.choices, i => (
          <div key={i} className={styles.row}>
            <div className={styles.firstColumn}>
              <div className={styles.item}>
                <LabelEditor
                  onChange={e => this.changeLeftChoice('choicesTexts', i, e)}
                  maxWidth={150}
                  value={props.choicesTexts[i].split(':')[0] || moduleConfig.defaultChoiceText(i + 1)}
                />
              </div>
            </div>
            <div className={styles.inputs}>
              {_.times(props.scalePoints, j => (
                <input
                  key={j}
                  name={`${model.name}_${i}`}
                  type="radio"
                  className={styles.input}
                />
              ))}
              {this.renderNotApplicableCheckbox(i)}
            </div>
            <div className={styles.lastColumn}>
              <div className={styles.item}>
                <LabelEditor
                  onChange={e => this.changeRightChoice('choicesTexts', i, e)}
                  maxWidth={150}
                  value={props.choicesTexts[i].split(':')[1] || 'Right'}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }
}
