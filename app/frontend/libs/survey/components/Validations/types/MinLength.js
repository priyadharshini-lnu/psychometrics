import React from 'react'
import styles from 'views/PropertyPanel/components/PropertyPanel.scss'

export default function MinLength ({ model, changeValidationArg }) {
  return (
    <div>
      <div className={styles.label}>Minimum Length</div>
      <input
        type="text"
        onChange={changeValidationArg}
        data-arg="minLength"
        value={model.validation.args.minLength || ''}
      />
    </div>
  )
}
