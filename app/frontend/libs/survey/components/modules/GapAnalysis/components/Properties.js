import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import PropertyPanelStore from 'store/PropertyPanelStore'
import styles from 'views/PropertyPanel/components/PropertyPanel.scss'
import ChoicesInput from 'components/ChoicesInput'
import Utils from 'utils'
import Action from 'undo'
import { RequiredValidations } from 'components/Validations'

export class Properties extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    restricted: PropTypes.bool,
  }

  update = () => {
    const { model } = this.props
    model.update()
    PropertyPanelStore.update()
  }

  changeField = (fieldName, e) => {
    const { model } = this.props
    model.changeProps({ [fieldName]: e.currentTarget.value })
    PropertyPanelStore.update()
  }

  changeStatements = (val, undo) => {
    const { model, model: { props, moduleConfig } } = this.props
    const oldValue = props.choices
    props.choices = Utils.limit(val)
    props.choicesTexts.splice(props.choices)
    props.categoriesData.splice(props.choices)
    for (let i = 0; i < props.choices; i += 1) {
      if (!props.choicesTexts[i]) {
        props.choicesTexts[i] = module.defaultCategoryText(i + 1)
      }
      if (!props.categoriesData[i]) {
        props.categoriesData[i] = {
          texts: _.times(props.scalePoints, () => moduleConfig.defaultAnswerText()),
        }
      }
    }
    if (!undo) {
      Action('GapAnalysisChangeChoices', this, { oldValue, newValue: props.choices })
    }
    model.update()
    this.forceUpdate()
  }

  changeScalePoints = (val, undo) => {
    const { model, model: { props, moduleConfig } } = this.props
    const oldValue = props.scalePoints
    props.scalePoints = Utils.limit(val)
    for (let i = 0; i < props.choices; i += 1) {
      props.categoriesData[i].texts.splice(props.scalePoints)
      _.times(props.scalePoints, (j) => {
        props.categoriesData[i].texts[j] = props.categoriesData[i].texts[j] || moduleConfig.defaultAnswerText()
      })
    }
    if (!undo) {
      Action('ChangeScalePoints', this, { oldValue, newValue: props.scalePoints })
    }
    model.update()
    this.forceUpdate()
  }

  renderRepeatHeaders () {
    const { model, model: { props: { type } } } = this.props
    return (
      <div className={styles.fieldset}>
        <div className={styles.label}>Type</div>
        {
          ['Positive', 'Negative'].map(innerType => (
            <label key={innerType} className={styles.inputLabel}>
              <input
                checked={type === innerType}
                type="radio"
                name={`q_${model.id}_type`}
                onChange={this.changeField.bind(this, 'type')}
                value={innerType}
              />
              {' '}
              {innerType}
            </label>
          ))
        }
      </div>
    )
  }

  renderStatements () {
    const { model, model: { props } } = this.props
    return (
      <div className={styles.fieldset}>
        <span className={styles.label}>Categories</span>
        <ChoicesInput value={props.choices} model={model} onChange={this.changeStatements} />
      </div>
    )
  }

  renderScalePoints () {
    const { model, model: { props } } = this.props
    return (
      <div>
        <div className={styles.fieldset}>
          <span className={styles.label}>Answers</span>
          <ChoicesInput value={props.scalePoints} model={model} onChange={this.changeScalePoints} />
        </div>
        <hr className={styles.divider} />
      </div>
    )
  }

  render () {
    const { model, restricted } = this.props
    return (
      <div>
        {this.renderStatements()}
        <hr className={styles.divider} />
        {this.renderScalePoints()}
        {this.renderRepeatHeaders()}
        <hr className={styles.divider} />
        {!restricted && (
          <RequiredValidations
            model={model}
            update={() => this.forceUpdate()}
          />
        )}
      </div>
    )
  }
}

export default Properties
