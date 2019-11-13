import React from 'react'
import _ from 'lodash'
import styles from 'views/PropertyPanel/components/PropertyPanel.scss'
import Labels from './Labels'

export default function CustomValidations ({ model, changeValidationType }) {
  const module = model.moduleConfig
  if (!module.validations) { return null }
  const validationType = model.validation.type
  let validation
  if (_.isArray(module.validations)) {
    validation = module.validations
  } else {
    validation = module.validations[model.props.type]
  }

  return (
    <div>
      {_.map(validation, (type, i) => (
        <label className={styles.inputLabel} key={i}>
          <input
            checked={validationType === type}
            type="radio"
            name={`q_${model.id}_validation_type`}
            onChange={changeValidationType}
            value={type}
          />
          {' '}
          {Labels[type]}
        </label>
      ))}
    </div>
  )
}
