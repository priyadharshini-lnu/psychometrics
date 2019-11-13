import React, { Component } from 'react'
import PropTypes from 'prop-types'
import PropertyPanelStore from 'store/PropertyPanelStore'
import styles from 'views/PropertyPanel/components/PropertyPanel.scss'
import ChoicesInput from 'components/ChoicesInput'
import Utils from 'utils'
import _ from 'lodash'
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
    model.props.type = type
    model.update()
    PropertyPanelStore.update()
  }

  changeField = (fieldName, value) => {
    const { model } = this.props
    model.props[fieldName] = value.currentTarget ? value.currentTarget.value : value
    model.update()
    PropertyPanelStore.update()
  }

  changeOptions = (e) => {
    const { model } = this.props
    const { options } = model.props
    if (e.currentTarget.checked) {
      options.push(e.currentTarget.name)
    } else {
      model.props.options = _.remove(options, n => n !== e.currentTarget.name)
    }
    model.update()
    PropertyPanelStore.update()
  }

  changeChoices = (val) => {
    const { model, model: { props } } = this.props

    props.choices = val
    props.fakeResults.splice(props.choices)
    props.choicesTexts.splice(props.choices)
    for (let i = 0; i < props.choices; i += 1) {
      if (!props.choicesTexts[i]) {
        props.choicesTexts[i] = model.moduleConfig.defaultChoiceText(i + 1)
      }
      if (typeof props.fakeResults[i] === 'undefined') {
        props.fakeResults[i] = 20
      }
    }
    model.update()
    this.forceUpdate()
  }

  changeLabels = (val) => {
    const { model, model: { props } } = this.props
    props.labels = Utils.limit(val)
    props.labelsTexts.splice(props.labels)
    for (let i = 0; i < props.labels; i += 1) {
      if (!props.labelsTexts[i]) {
        props.labelsTexts[i] = ''
      }
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

    if (model.props.type === 'Choice') { return }
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
            ['Choice', 'Bar', 'Slider'].map(innerType => (
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
    if (model.props.type === 'Choice') { return }
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

  renderMinValue () {
    const { model, model: { props } } = this.props
    if (model.props.type === 'Choice') { return }
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
    if (model.props.type === 'Choice') { return }
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

  renderNumberOfDecimal () {
    const { model, model: { props } } = this.props
    if (model.props.type === 'Choice') { return }
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
      </div>
    )
  }

  renderPosition () {
    const { model: { props } } = this.props
    const type = props.position
    if (props.type !== 'Choice') { return }
    return (
      <div className={styles.fieldset}>
        <div className={styles.label}>Position</div>
        {
          ['Horizontal', 'Vertical'].map(innerType => (
            <label key={innerType} className={styles.inputLabel}>
              <input
                checked={type === innerType}
                type="radio"
                onChange={e => this.changeField('position', e)}
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

  renderOptions () {
    const { model, model: { props } } = this.props
    if (props.type !== 'Choice' || props.position !== 'Vertical') { return }
    return (
      <div className={styles.fieldset}>
        <div className={styles.label}>Options</div>
        {
          ['Total Box'].map(innerType => (
            <label key={innerType} className={styles.inputLabel}>
              <input
                type="checkbox"
                onChange={this.changeOptions}
                name={innerType}
                checked={model.hasOption(innerType)}
              />
              {' '}
              {`${innerType}`}
            </label>
          ))
        }
      </div>
    )
  }

  renderSymbolTypes () {
    const { model } = this.props
    const type = model.props.symbolType
    const value = model.props.symbol
    if (model.props.type !== 'Choice') { return }
    return (
      <div className={styles.fieldset}>
        <div className={styles.label}>Symbol</div>
        {
          ['None', 'Before', 'After'].map(innerType => (
            <label key={innerType} className={styles.inputLabel}>
              <input
                checked={type === innerType}
                type="radio"
                name={`q_${model.id}_total_symbol_type`}
                onChange={this.changeField.bind(this, 'symbolType')}
                value={innerType}
              />
              {' '}
              {innerType}
            </label>
          ))
        }
        {
          type !== 'None' && (
            <input
              className={styles.totalInput}
              name={`q_${model.id}_total_symbol`}
              onChange={this.changeField.bind(this, 'symbol')}
              value={value}
            />
          )}
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
        {this.renderNumberOfDecimal()}
        {this.renderPosition()}
        {this.renderOptions()}
        {this.renderSymbolTypes()}
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
