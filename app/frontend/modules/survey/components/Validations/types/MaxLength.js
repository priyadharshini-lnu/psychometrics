import React from 'react'
import styles from 'views/PropertyPanel/components/PropertyPanel.scss'

export default function MaxLength ({ model, changeValidationArg }) {
  return (
    <div>
      <div className={styles.label}>Maximum Length</div>
      <input
        type="text"
        onChange={changeValidationArg}
        data-arg="maxLength"
        value={model.validation.args.maxLength || ''}
      />
    </div>
  )
}
