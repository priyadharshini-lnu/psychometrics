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
    if (type === 'Form' || model.props.type === 'Form') {
      model.resetDefaultValues()
    }
    model.changeProps({ type })
    PropertyPanelStore.update()
  }

  changeFormFields = (val) => {
    const { model } = this.props
    model.setFormFields(val)
    this.forceUpdate()
  }

  renderFormFields () {
    const { model } = this.props
    return (
      <div className={styles.fieldset} style={{ position: 'relative' }}>
        <span className={styles.label}>Form Fields</span>
        <ChoicesInput model={model} onChange={this.changeFormFields} />
      </div>
    )
  }

  render () {
    const { model, restricted } = this.props
    const { type } = model.props

    return (
      <div>
        {type === 'Form' && this.renderFormFields()}
        {type === 'Form' && <hr className={styles.divider} />}
        <div className={styles.fieldset}>
          <div className={styles.label}>Answers</div>
          <label className={styles.inputLabel}>
            <input
              checked={type === 'SingleLine'}
              type="radio"
              name={`q_${model.id}_type`}
              onChange={this.changeType}
              value="SingleLine"
            />
            {' '}
            Single Line
          </label>
          <label className={styles.inputLabel}>
            <input
              checked={type === 'MultiLine'}
              type="radio"
              name={`q_${model.id}_type`}
              onChange={this.changeType}
              value="MultiLine"
            />
            {' '}
            Multi Line
          </label>
          <label className={styles.inputLabel}>
            <input
              checked={type === 'EssayTextBox'}
              type="radio"
              name={`q_${model.id}_type`}
              onChange={this.changeType}
              value="EssayTextBox"
            />
            {' '}
            Essay Text Box
          </label>
          <label className={styles.inputLabel}>
            <input
              checked={type === 'Form'}
              type="radio"
              name={`q_${model.id}_type`}
              onChange={this.changeType}
              value="Form"
            />
            {' '}
            Form
          </label>
          <label className={styles.inputLabel}>
            <input
              checked={type === 'Password'}
              type="radio"
              name={`q_${model.id}_type`}
              onChange={this.changeType}
              value="Password"
            />
            {' '}
            Password
          </label>
          <label className={styles.inputLabel}>
            <input
              checked={type === 'DateEntry'}
              type="radio"
              name={`q_${model.id}_type`}
              onChange={this.changeType}
              value="DateEntry"
            />
            {' '}
            Date
          </label>
          <label className={styles.inputLabel}>
            <input
              checked={type === 'DateTimeEntry'}
              type="radio"
              name={`q_${model.id}_type`}
              onChange={this.changeType}
              value="DateTimeEntry"
            />
            {' '}
            Date & Time
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
