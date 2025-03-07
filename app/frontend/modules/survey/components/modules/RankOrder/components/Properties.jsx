import { Component } from 'react'
import PropTypes from 'prop-types'
import styles from '~/modules/survey/views/PropertyPanel/components/PropertyPanel.less'
import ChoicesInput from '~/modules/survey/components/ChoicesInput'
import ValidationTypes from '~/modules/survey/components/ValidationTypes'
import RequiredValidations from '~/modules/survey/components/RequiredValidations'

export class Properties extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    restricted: PropTypes.bool,
  }

  update = () => {
    const { model } = this.props
    model.update()
  }

  changeType = (e) => {
    const { model } = this.props
    const type = e.currentTarget.value
    model.resetValidation()
    model.changeProps({ type })
  }

  changeChoices = (val) => {
    const { model } = this.props
    model.setChoices(val)
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

  renderDescriptionCheckbox () {
    const { model, model: { props: { showDescription } } } = this.props
    return (
      <div className={styles.fieldset}>
        <label className={styles.inputLabel}>
          <input
            type="checkbox"
            checked={showDescription}
            onChange={e => model.changeProps({ showDescription: e.target.checked })}
          />
          {' '}
          Description
        </label>
      </div>
    )
  }

  render () {
    const { model, restricted, showOnlyTranslatable } = this.props
    const { type } = model.props

    if (showOnlyTranslatable && !restricted) {
      return (
        <div>
          <ValidationTypes
            model={model}
            update={() => this.forceUpdate()}
          />
        </div>
      )
    }

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
        {this.renderDescriptionCheckbox()}
        <hr className={styles.divider} />
        {!restricted && (
          <RequiredValidations
            model={model}
            update={() => this.forceUpdate()}
          />
        )}
        {!restricted && (
          <ValidationTypes
            model={model}
            update={() => this.forceUpdate()}
          />
        )}
      </div>
    )
  }
}

export default Properties
