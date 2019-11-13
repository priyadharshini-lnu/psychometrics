import React, { Component } from 'react'
import PropTypes from 'prop-types'
import PropertyPanelStore from 'store/PropertyPanelStore'
import styles from 'views/PropertyPanel/components/PropertyPanel.scss'
import ChoicesInput from 'components/ChoicesInput'
import Utils from 'utils'
import Action from 'undo'
import Validations, { RequiredValidations } from 'components/Validations'

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

  // ====================================
  // CHANGES
  // ====================================
  changeType = (e) => {
    const { model } = this.props
    const type = e.currentTarget.value
    model.changeProps({ type })
    PropertyPanelStore.update()
  }

  changeField = (fieldName, event) => {
    const { model } = this.props
    const target = event.currentTarget
    let value
    if (target) {
      value = target.type === 'checkbox' ? target.checked : target.value
    } else {
      value = event
    }
    model.changeProps({ [fieldName]: value })
    PropertyPanelStore.update()
  }

  changeStars = (value) => {
    const { model, model: { props } } = this.props
    for (let i = 0, len = props.fakeResultsStars.length; i < len; i += 1) {
      if (props.fakeResultsStars[i] && props.fakeResultsStars[i] > value) {
        props.fakeResultsStars[i] = value
      }
    }

    model.changeProps({ stars: value })
    PropertyPanelStore.update()
  }

  changeChoices = (val, undo) => {
    const { model, model: { props } } = this.props
    const oldValue = props.choices
    props.choices = val
    const newValue = props.choices
    props.fakeResults.splice(props.choices)
    props.fakeResultsStars.splice(props.choices)
    props.choicesTexts.splice(props.choices)
    for (let i = 0; i < props.choices; i += 1) {
      if (!props.choicesTexts[i]) {
        props.choicesTexts[i] = model.moduleConfig.defaultChoiceText(i + 1)
      }
      if (typeof props.fakeResults[i] === 'undefined') {
        props.fakeResults[i] = 20
      }
      if (typeof props.fakeResultsStars[i] === 'undefined') {
        props.fakeResultsStars[i] = 1
      } else if (props.fakeResultsStars[i] > props.choices) {
        props.fakeResultsStars[i] = props.choices
      }
    }

    if (!undo) {
      Action('ChangeChoices', this, { oldValue, newValue })
    }
    model.update()
    this.forceUpdate()
  }

  changeHideChoiceText = (val) => {
    const { model: { props } } = this.props
    props.hideChoiceText = val
  }

  changeLabels = (val, undo) => {
    const { model, model: { props } } = this.props
    const oldValue = props.labels
    props.labels = Utils.limit(val)
    const newValue = props.labels
    props.labelsTexts.splice(props.labels)
    for (let i = 0; i < props.labels; i += 1) {
      if (!props.labelsTexts[i]) {
        props.labelsTexts[i] = ''
      }
    }
    if (!undo) {
      Action('ChangeLabels', this, { oldValue, newValue })
    }
    model.update()
    this.forceUpdate()
  }

  // ====================================
  // RENDERS
  // ====================================
  renderChoices () {
    const { model, model: { props } } = this.props
    return (
      <div>
        <div className={styles.fieldset}>
          <span className={styles.label}>Choices</span>
          <ChoicesInput maxValue={50} value={props.choices} model={model} onChange={this.changeChoices} />
        </div>
        <hr className={styles.divider} />
      </div>
    )
  }

  renderLabels () {
    const { model, model: { props } } = this.props
    if (props.type === 'Star') { return }
    return (
      <div>
        <div className={styles.fieldset}>
          <span className={styles.label}>Labels</span>
          <ChoicesInput value={props.labels} model={model} onChange={this.changeLabels} />
        </div>
        <hr className={styles.divider} />
      </div>
    )
  }

  renderTypes () {
    const { model: { props: { type } } } = this.props
    return (
      <div>
        <div className={styles.fieldset}>
          <div className={styles.label}>Type</div>
          {
            ['Bar', 'Slider', 'Star'].map(innerType => (
              <label key={innerType} className={styles.inputLabel}>
                <input
                  checked={type === innerType}
                  type="radio"
                  onChange={this.changeType}
                  value={innerType}
                />
                {' '}
                {`${innerType}s`}
              </label>
            ))
          }
        </div>
        <hr className={styles.divider} />
      </div>
    )
  }

  renderGridLines () {
    const { model, model: { props } } = this.props
    if (props.type === 'Star') { return }
    return (
      <div>
        <div className={styles.fieldset}>
          <span className={styles.label}>Grid Lines</span>
          <ChoicesInput
            value={props.gridLines}
            model={model}
            onChange={e => this.changeField('gridLines', e)}
          />
        </div>
        <hr className={styles.divider} />
      </div>
    )
  }

  renderStars () {
    const { model, model: { props } } = this.props
    if (props.type !== 'Star') { return }
    return (
      <div>
        <div className={styles.fieldset}>
          <span className={styles.label}>Stars</span>
          <ChoicesInput
            minValue={1}
            maxValue={12}
            value={props.stars}
            model={model}
            onChange={this.changeStars}
          />
        </div>
        <hr className={styles.divider} />
      </div>
    )
  }

  renderMinValue () {
    const { model, model: { props } } = this.props
    if (props.type === 'Star') { return }
    return (
      <div>
        <div className={styles.fieldset}>
          <span className={styles.label}>Min Value</span>
          <ChoicesInput
            value={props.minValue}
            model={model}
            onChange={e => this.changeField('minValue', e)}
          />
        </div>
        <hr className={styles.divider} />
      </div>
    )
  }

  renderMaxValue () {
    const { model, model: { props } } = this.props
    if (props.type === 'Star') { return }
    return (
      <div>
        <div className={styles.fieldset}>
          <span className={styles.label}>Max Value</span>
          <ChoicesInput
            maxValue={100000}
            value={props.maxValue}
            model={model}
            onChange={e => this.changeField('maxValue', e)}
          />
        </div>
        <hr className={styles.divider} />
      </div>
    )
  }

  renderDefaultValue () {
    const { model, model: { props } } = this.props
    if (props.type === 'Star') { return }
    return (
      <div>
        <div className={styles.fieldset}>
          <span className={styles.label}>Default Value</span>
          <ChoicesInput
            maxValue={props.maxValue}
            value={props.defaultValue || props.minValue}
            model={model}
            onChange={e => this.changeField('defaultValue', e)}
          />
        </div>
        <hr className={styles.divider} />
      </div>
    )
  }

  renderNumberOfDecimal () {
    const { model, model: { props } } = this.props
    if (props.type === 'Star') { return }
    return (
      <div>
        <div className={styles.fieldset}>
          <span className={styles.label}>Number of Decimals</span>
          <ChoicesInput
            maxValue={3}
            value={props.numberOfDecimals}
            model={model}
            onChange={e => this.changeField('numberOfDecimals', e)}
          />
        </div>
        <hr className={styles.divider} />
      </div>
    )
  }

  renderInteraction () {
    const { model: { props } } = this.props
    const type = props.interaction
    if (props.type !== 'Star') { return }
    return (
      <div className={styles.fieldset}>
        <div className={styles.label}>Interaction</div>
        {
          ['Discrete', 'Half Step', 'Continuous'].map(innerType => (
            <label key={innerType} className={styles.inputLabel}>
              <input
                checked={type === innerType}
                type="radio"
                onChange={e => this.changeField('interaction', e)}
                value={innerType}
              />
              {' '}
              {`${innerType}`}
            </label>
          ))
        }
      </div>
    )
  }

  renderTextDisplay () {
    const { model: { props } } = this.props
    return (
      <div className={styles.fieldset}>
        <div className={styles.label}>Hide text/labels</div>
        <label className={styles.inputLabel}>
          <input
            type="checkbox"
            checked={!!props.hideChoiceText}
            onChange={e => this.changeField('hideChoiceText', e)}
          />
          {' Choice text'}
        </label>
        <label className={styles.inputLabel}>
          <input
            type="checkbox"
            checked={!!props.hideGridValues}
            onChange={e => this.changeField('hideGridValues', e)}
          />
          {' Grid values'}
        </label>
        <label className={styles.inputLabel}>
          <input
            type="checkbox"
            checked={!!props.hideValue}
            onChange={e => this.changeField('hideValue', e)}
          />
          {' Slider value'}
        </label>
      </div>
    )
  }

  render () {
    const { model, restricted } = this.props
    return (
      <div>
        {this.renderChoices()}
        {this.renderLabels()}
        {this.renderTypes()}
        {this.renderGridLines()}
        {this.renderMinValue()}
        {this.renderMaxValue()}
        {this.renderDefaultValue()}
        {this.renderNumberOfDecimal()}
        {this.renderTextDisplay()}
        {this.renderStars()}
        {this.renderInteraction()}
        <hr className={styles.divider} />
        {!restricted && (
        <RequiredValidations
          model={model}
          update={() => this.forceUpdate()}
        />
        )}
        {!restricted && (
        <Validations
          model={model}
          update={() => this.forceUpdate()}
        />
        )}
      </div>
    )
  }
}

export default Properties
