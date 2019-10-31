import React from 'react'
import styles from 'views/PropertyPanel/components/PropertyPanel.scss'
import store from 'store/CustomValidationStore'
import Utils from 'utils'
import CustomValidations from './CustomValidations'
import VALIDATIONS from './types'

const CustomField = ({ model, update }) => {
  const changeValidationArg = (e) => {
    const { arg } = e.currentTarget.dataset
    const val = e.currentTarget.value
    if (model.validation.type === 'Content' && arg === 'type') {
      model.validation.args[arg] = val
    } else {
      model.validation.args[arg] = Utils.parseFloat(val)
    }
    model.update()
    update()
  }

  const module = model.moduleConfig
  if (!module.validations) { return null }
  const validationType = model.validation.type
  if (!VALIDATIONS[validationType]) { return null }
  const Validation = VALIDATIONS[validationType]
  return <Validation model={model} changeValidationArg={changeValidationArg} />
}

export default function Validations ({ model, update }) {
  const changeValidationType = (e) => {
    const type = e.currentTarget.value
    if (type === 'Custom') {
      store.open(model, () => {
        update()
      })
    } else {
      model.changeValidation({ type, args: {} })
      update()
    }
  }

  const { type } = model.validation
  return (
    <div className={styles.fieldset}>
      <div className={styles.label}>Validation Type</div>
      <label className={styles.inputLabel}>
        <input
          checked={type === 'None'}
          type="radio"
          name={`q_${model.id}_validation_type`}
          onChange={changeValidationType}
          value="None"
        />
        {' '}
        None
      </label>
      <CustomValidations model={model} update={update} changeValidationType={changeValidationType} />
      <label className={styles.inputLabel} style={{ cursor: 'pointer', color: '#366ccc' }}>
        <input
          checked={type === 'Custom'}
          type="radio"
          name={`q_${model.id}_validation_type`}
          onClick={changeValidationType}
          value="Custom"
        />
        {' '}
        Custom Validation
      </label>
      <CustomField model={model} update={update} />
    </div>
  )
}
