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

  changeType = (e) => {
    const { model } = this.props
    const type = e.currentTarget.value
    model.changeProps({ type })
    PropertyPanelStore.update()
  }

  changeChoices = (val) => {
    const { model } = this.props
    model.setChoices(val)
    this.forceUpdate()
  }

  changeScalePoints = (val, undo) => {
    const { model, model: { props } } = this.props
    const oldValue = props.scalePoints
    props.scalePoints = Utils.limit(val)
    const newValue = props.scalePoints
    props.scalePointsTexts.splice(props.scalePoints)
    for (let i = 0; i < props.scalePoints; i += 1) {
      if (!props.scalePointsTexts[i]) {
        props.scalePointsTexts[i] = ''
      }
    }
    if (!undo) {
      Action('ChangeScalePoints', this, { oldValue, newValue })
    }
    model.update()
    this.forceUpdate()
  }

  changeColumns = (e) => {
    const { model } = this.props
    model.changeProps({ columns: (e.currentTarget.value === 'true') })
    this.forceUpdate()
  }

  changeStackItems = (e) => {
    const { model } = this.props
    model.changeProps({ stackItems: e.currentTarget.checked })
    this.forceUpdate()
  }

  changeStackItemsGroup = (e) => {
    const { model } = this.props
    model.changeProps({ stackItemsGroup: e.currentTarget.checked })
    this.forceUpdate()
  }

  renderChoices () {
    const { model } = this.props
    return (
      <div>
        <div className={styles.fieldset}>
          <span className={styles.label}>Items</span>
          <ChoicesInput model={model} onChange={this.changeChoices} />
        </div>
        <hr className={styles.divider} />
      </div>
    )
  }

  renderScalePoints () {
    const { model, model: { props } } = this.props
    return (
      <div>
        <div className={styles.fieldset}>
          <span className={styles.label}>Groups</span>
          <ChoicesInput
            maxValue={100}
            value={props.scalePoints}
            model={model}
            onChange={this.changeScalePoints}
          />
        </div>
        <hr className={styles.divider} />
      </div>
    )
  }

  renderColumns () {
    const { model, model: { props: { columns } } } = this.props

    return (
      <div className={styles.fieldset}>
        <div className={styles.label}>Columns</div>
        <label className={styles.inputLabel}>
          <input
            checked={columns === true}
            type="radio"
            name={`q_${model.id}_columns`}
            onChange={this.changeColumns}
            value="true"
          />
          {' '}
          Yes
        </label>
        <label className={styles.inputLabel}>
          <input
            checked={columns === false}
            type="radio"
            name={`q_${model.id}_columns`}
            onChange={this.changeColumns}
            value="false"
          />
          {' '}
          No
        </label>
      </div>
    )
  }

  renderOptions () {
    const { model, model: { props } } = this.props

    return (
      <div className={styles.fieldset}>
        <div className={styles.label}>Columns</div>
        <label className={styles.inputLabel}>
          <input
            checked={props.stackItems === true}
            type="checkbox"
            name={`q_${model.id}_options`}
            onChange={this.changeStackItems}
            value="true"
          />
          {' '}
          Stack Items
        </label>
        <label className={styles.inputLabel}>
          <input
            checked={props.stackItemsGroup === true}
            type="checkbox"
            name={`q_${model.id}_options`}
            onChange={this.changeStackItemsGroup}
            value="true"
          />
          {' '}
          Stack Items in Groups
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
        {this.renderScalePoints()}
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
        </div>
        {this.renderColumns()}
        {this.renderOptions()}
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
