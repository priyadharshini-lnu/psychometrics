import React from 'react'
import styles from 'views/PropertyPanel/components/PropertyPanel.scss'

export default function MustTotal ({ model, changeValidationArg }) {
  return (
    <div>
      <div className={styles.label}>Choices Must Total</div>
      <input
        type="text"
        onChange={changeValidationArg}
        data-arg="mustTotal"
        value={model.validation.args.mustTotal || ''}
      />
    </div>
  )
}
