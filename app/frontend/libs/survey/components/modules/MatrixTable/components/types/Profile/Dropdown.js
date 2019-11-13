import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import LabelEditor from 'components/LabelEditor'
import styles from './Profile.scss'

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
    const { model, model: { props, moduleConfig } } = this.props

    return (
      <div className={styles.table}>
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
                <label className={styles.inputGroup}>
                  <div>
                    <LabelEditor
                      onChange={e => this.changeLabel('scalePointsTexts', j, e)}
                      maxWidth={150}
                      value={props.scalePointsTexts[j] || moduleConfig.defaultScalePointText(j + 1)}
                    />
                  </div>
                  <input
                    key={j}
                    name={`${model.name}_${i}`}
                    type="radio"
                    disabled
                    className={styles.input}
                  />
                </label>
              ))}
              {this.renderNotApplicableHeader()}
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
