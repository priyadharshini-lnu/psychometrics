import React from 'react'
import styles from 'views/PropertyPanel/components/PropertyPanel.scss'

export default function RequiredValidations ({ model, update }) {
  const changeRequiredType = (e) => {
    const type = e.currentTarget.value
    model.changeReqValidations({ type })
    update()
  }
  const toggleRequired = () => {
    model.changeReqValidations({ enabled: !model.requiredValidation.enabled })
    update()
  }

  const requiredValidation = model.requiredValidation.enabled
  const disabled = !requiredValidation
  const { type } = model.requiredValidation
  return (
    <div className={styles.fieldset}>
      <div className={styles.label}>Validation Options</div>
      <label className={styles.inputLabel}>
        <input type="checkbox" checked={requiredValidation} onChange={toggleRequired} />
        {' Enable'}
      </label>
      <label className={styles.inputLabel}>
        <input
          disabled={disabled}
          checked={type === 'Force'}
          type="radio"
          name={`q_${model.id}_validation_opt_type`}
          onChange={changeRequiredType}
          value="Force"
        />
        {' '}
Force Response
      </label>
      <label className={styles.inputLabel}>
        <input
          disabled={disabled}
          checked={type === 'Request'}
          type="radio"
          name={`q_${model.id}_validation_opt_type`}
          onChange={changeRequiredType}
          value="Request"
        />
        {' '}
Request Response
      </label>
    </div>
  )
}
