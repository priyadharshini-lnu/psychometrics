import _ from 'lodash'
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

  changeField = (fieldName, e) => {
    const { model } = this.props
    model.changeProps({ [fieldName]: e.currentTarget.value })
    PropertyPanelStore.update()
  }

  changeStatements = (val) => {
    const { model } = this.props
    model.setChoices(val)
    this.forceUpdate()
  }

  changeScalePoints = (val, undo) => {
    const { model, model: { props, moduleConfig } } = this.props
    const oldValue = props.scalePoints
    props.scalePoints = Utils.limit(val)
    const newValue = props.scalePoints
    props.columnsData.splice(props.scalePoints)
    for (let i = 0; i < props.scalePoints; i += 1) {
      if (!props.columnsData[i]) {
        props.columnsData[i] = _.cloneDeep(moduleConfig.defaultColumn)
      }
    }
    if (!undo) {
      Action('ChangeScalePoints', this, { oldValue, newValue })
    }
    model.update()
    this.forceUpdate()
  }

  renderRepeatHeaders () {
    const { model } = this.props
    const type = model.props.repeatHeaders
    return (
      <div className={styles.fieldset}>
        <div className={styles.label}>Repeat Headers</div>
        {
          ['None', 'Middle', 'Bottom', 'Both', 'All'].map(innerType => (
            <label key={innerType} className={styles.inputLabel}>
              <input
                checked={type === innerType}
                type="radio"
                name={`q_${model.id}_repeat_headers`}
                onChange={e => this.changeField('repeatHeaders', e)}
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
        <span className={styles.label}>Statements</span>
        <ChoicesInput value={props.choices} model={model} onChange={this.changeStatements} />
      </div>
    )
  }

  renderScalePoints () {
    const { model, model: { props } } = this.props
    if (props.type === 'MaxDiff') { return }
    return (
      <div>
        <div className={styles.fieldset}>
          <span className={styles.label}>Columns</span>
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
