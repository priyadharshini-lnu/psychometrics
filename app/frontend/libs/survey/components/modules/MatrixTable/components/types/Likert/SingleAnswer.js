import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import LabelEditor from 'components/LabelEditor'
import styles from './Likert.scss'

export default class extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  changeLabel = (collection, i, text) => {
    const { model } = this.props
    model.changeArrayProps({ collection, i, val: text })
    this.forceUpdate()
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
        </div>
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
                <input
                  key={j}
                  name={`${model.name}_${i}`}
                  type={props.answersType === 'SingleAnswer' ? 'radio' : 'checkbox'}
                  className={styles.input}
                />
              ))}
              {this.renderNotApplicableCheckbox(`${model.name}_${i}`)}
            </div>
          </div>
        ))}
      </div>
    )
  }
}
