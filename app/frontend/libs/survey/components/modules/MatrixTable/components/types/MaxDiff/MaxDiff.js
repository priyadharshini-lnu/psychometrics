import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import LabelEditor from 'components/LabelEditor'
import styles from './MaxDiff.scss'

export default class extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  update = () => {
    this.forceUpdate()
  }

  changeLabel = (collection, i, text) => {
    const { model } = this.props
    model.changeArrayProps({ collection, i, val: text })
    this.update()
  }

  changeNotApplicableLabel = (value) => {
    const { model } = this.props
    model.changeProps({ notApplicableLabel: value })
    this.forceUpdate()
  }

  renderNotApplicableHeader () {
    const { model: { props: { notApplicable, notApplicableLabel } } } = this.props
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
    const { model: { props: { notApplicable, answersType } } } = this.props
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
        <div className={`${styles.row} ${styles.header}`}>
          <div className={`${styles.column} ${styles.firstColumn}`}>
            <LabelEditor
              onChange={e => this.changeLabel('scalePointsTexts', 0, e)}
              maxWidth={150}
              value={props.scalePointsTexts[0] || moduleConfig.defaultScalePointText(1)}
            />
          </div>
          <div className={`${styles.choice} ${styles.choiceHeader}`}>
            <div />
            {this.renderNotApplicableHeader()}
          </div>
          <div className={`${styles.column} ${styles.lastColumn}`}>
            <LabelEditor
              onChange={e => this.changeLabel('scalePointsTexts', 1, e)}
              maxWidth={150}
              value={props.scalePointsTexts[1] || moduleConfig.defaultScalePointText(2)}
            />
          </div>
        </div>

        {_.times(props.choices, i => (
          <div key={i} className={styles.row}>
            <div className={`${styles.column} ${styles.firstColumn}`}>
              <input
                name={`${model.name}_${i}`}
                type="radio"
                className={styles.input}
              />
            </div>
            <div className={styles.choice}>
              <LabelEditor
                onChange={e => this.changeLabel('choicesTexts', i, e)}
                maxWidth={150}
                value={props.choicesTexts[i] || moduleConfig.defaultChoiceText(i)}
              />
              {this.renderNotApplicableCheckbox()}
            </div>
            <div className={`${styles.column} ${styles.lastColumn}`}>
              <input
                name={`${model.name}_${i}`}
                type="radio"
                className={styles.input}
              />
            </div>
          </div>
        ))}
      </div>
    )
  }
}
