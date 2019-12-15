import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import LabelEditor from 'components/LabelEditor'
import styles from './Likert.scss'

export default class extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  state = {
    edit: false,
  }

  changeLabel = (collection, i, text) => {
    const { model } = this.props
    model.changeArrayProps({ collection, i, val: text })
    this.forceUpdate()
  }

  edit = () => {
    this.setState({ edit: true })
  }

  endEdit = () => {
    this.setState({ edit: false })
  }

  changeNotApplicableLabel = (value) => {
    const { model } = this.props
    model.changeProps({ notApplicableLabel: value })
    this.forceUpdate()
  }

  renderNotApplicableOption () {
    const { model } = this.props
    const { notApplicable, notApplicableLabel } = model.props
    if (!notApplicable) { return null }
    return (
      <option>{notApplicableLabel}</option>
    )
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

  renderPreview () {
    const { model: { props, moduleConfig } } = this.props
    return (
      <div className={styles.table}>
        {_.times(props.choices, i => (
          <div key={i} className={`${styles.row} ${styles.dropdown}`}>
            <div className={styles.firstColumn}>
              <div className={styles.item}>
                <LabelEditor
                  onChange={e => this.changeLabel('choicesTexts', i, e)}
                  maxWidth={150}
                  value={props.choicesTexts[i] || moduleConfig.defaultChoiceText(i + 1)}
                />
              </div>
            </div>
            <div className={styles.controls}>
              <select className={`form-control ${styles.select}`}>
                <option />
                {_.times(props.scalePoints, j => (
                  <option key={j} value={`scale_points_${j}`}>
                    {props.scalePoints[j] || moduleConfig.defaultScalePointText(j)}
                  </option>
                ))}
                {this.renderNotApplicableOption(i)}
              </select>
            </div>
          </div>
        ))}
        <div>
          <a onClick={this.edit}>Click here to edit answers</a>
        </div>
      </div>
    )
  }

  renderEdit () {
    const { model: { props, moduleConfig } } = this.props

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

          </div>
        ))}
        <div>
          <a onClick={this.endEdit}>Back to preview</a>
        </div>
      </div>
    )
  }

  render () {
    const { edit } = this.state
    return (
      edit ? this.renderEdit() : this.renderPreview()
    )
  }
}
