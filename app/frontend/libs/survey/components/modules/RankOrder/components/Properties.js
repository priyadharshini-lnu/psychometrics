import React, { Component } from 'react'
import PropTypes from 'prop-types'
import PropertyPanelStore from 'store/PropertyPanelStore'
import styles from 'views/PropertyPanel/components/PropertyPanel.scss'
import ChoicesInput from 'components/ChoicesInput'
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

  changeType = (e) => {
    const { model } = this.props
    const type = e.currentTarget.value
    model.resetValidation()
    model.changeProps({ type })
    PropertyPanelStore.update()
  }

  changeChoices = (val) => {
    const { model } = this.props
    model.setChoices(val)
    this.forceUpdate()
  }

  renderChoices () {
    const { model } = this.props
    return (
      <div className={styles.fieldset}>
        <span className={styles.label}>Items</span>
        <ChoicesInput model={model} onChange={this.changeChoices} />
      </div>
    )
  }

  render () {
    const { model, restricted } = this.props
    const { type } = model.props

    return (
      <div>
        {this.renderChoices()}
        <hr className={styles.divider} />
        <div className={styles.fieldset}>
          <div className={styles.label}>Type</div>
          <label className={styles.inputLabel}>
            <input
              checked={type === 'DragAndDrop'}
              type="radio"
              name={`q_${model.id}_type`}
              onChange={this.changeType}
              value="DragAndDrop"
            />
            {' '}
            Drag and Drop
          </label>
          <label className={styles.inputLabel}>
            <input
              checked={type === 'RadioButtons'}
              type="radio"
              name={`q_${model.id}_type`}
              onChange={this.changeType}
              value="RadioButtons"
            />
            {' '}
            Radio Buttons
          </label>
          <label className={styles.inputLabel}>
            <input
              checked={type === 'TextBox'}
              type="radio"
              name={`q_${model.id}_type`}
              onChange={this.changeType}
              value="TextBox"
            />
            {' '}
            Text Box
          </label>
          <label className={styles.inputLabel}>
            <input
              checked={type === 'SelectBox'}
              type="radio"
              name={`q_${model.id}_type`}
              onChange={this.changeType}
              value="SelectBox"
            />
            {' '}
            Select Box
          </label>
        </div>
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
