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

  changeType = (e) => {
    const { model } = this.props
    const type = e.currentTarget.value
    model.resetDefaultValues()
    model.changeProps({ type })
    PropertyPanelStore.update()
  }

  changePosition = (e) => {
    const { model: { props } } = this.props
    props.position = e.currentTarget.value
    this.update()
  }

  changeNotApplicable = () => {
    const { model: { props } } = this.props
    props.notApplicable = !props.notApplicable
    this.update()
  }

  update = () => {
    const { model } = this.props
    model.update()
    PropertyPanelStore.update()
  }

  changeChoices = (val) => {
    const { model } = this.props
    model.setChoices(val)
    this.forceUpdate()
  }

  notApplicable () {
    const { model } = this.props
    const { notApplicable } = model.props
    return (
      <div className={styles.fieldset}>
        <label className={styles.inputLabel}>
          <input checked={!!notApplicable} type="checkbox" onChange={this.changeNotApplicable} />
          Not Applicable
        </label>
      </div>
    )
  }

  renderChoices () {
    const { model } = this.props
    return (
      <div className={styles.fieldset}>
        <span className={styles.label}>Choices</span>
        <ChoicesInput model={model} onChange={this.changeChoices} />
      </div>
    )
  }

  renderPosition () {
    const { model } = this.props
    const { type, position } = model.props
    if (type !== 'SingleAnswer' && type !== 'MultipleAnswer') { return }
    return (
      <div className={styles.fieldset}>
        <div className={styles.label}>Position</div>
        <label className={styles.inputLabel}>
          <input checked={position === 'Vertical'} type="radio" onChange={this.changePosition} value="Vertical" />
          Vertical
        </label>
        <label className={styles.inputLabel}>
          <input checked={position === 'Horizontal'} type="radio" onChange={this.changePosition} value="Horizontal" />
          Horizontal
        </label>
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
          <div className={styles.label}>Answers</div>
          <label className={styles.inputLabel}>
            <input
              checked={type === 'SingleAnswer'}
              type="radio"
              name={`q_${model.id}_type`}
              onChange={this.changeType}
              value="SingleAnswer"
            />
            {' '}
            Single Answer
          </label>
          <label className={styles.inputLabel}>
            <input
              checked={type === 'MultipleAnswer'}
              type="radio"
              name={`q_${model.id}_type`}
              onChange={this.changeType}
              value="MultipleAnswer"
            />
            {' '}
            Multiple Answer
          </label>
          <label className={styles.inputLabel}>
            <input
              checked={type === 'Dropdown'}
              type="radio"
              name={`q_${model.id}_type`}
              onChange={this.changeType}
              value="Dropdown"
            />
            {' '}
            Dropdown list
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
          <label className={styles.inputLabel}>
            <input
              checked={type === 'MultiSelectBox'}
              type="radio"
              name={`q_${model.id}_type`}
              onChange={this.changeType}
              value="MultiSelectBox"
            />
            {' '}
            Multi Select
            Box
          </label>
        </div>
        <hr className={styles.divider} />
        {this.notApplicable()}
        <hr className={styles.divider} />
        {this.renderPosition()}
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
