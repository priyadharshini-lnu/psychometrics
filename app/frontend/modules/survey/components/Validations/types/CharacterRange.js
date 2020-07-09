import React from 'react'
import styles from 'views/PropertyPanel/components/PropertyPanel.scss'

export default function CharacterRange ({ model, changeValidationArg }) {
  return [
    <div key={0}>
      <div className={styles.label}>Minimum Length</div>
      <input
        type="text"
        onChange={changeValidationArg}
        data-arg="minLength"
        value={model.validation.args.minLength || ''}
      />
    </div>,
    <div key={1}>
      <div className={styles.label}>Maximum Length</div>
      <input
        type="text"
        onChange={changeValidationArg}
        data-arg="maxLength"
        value={model.validation.args.maxLength || ''}
      />
    </div>,
  ]
}
