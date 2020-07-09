import React from 'react'
import styles from 'views/PropertyPanel/components/PropertyPanel.scss'

export default function Range ({ model, changeValidationArg }) {
  return [
    <div key={0}>
      <div className={styles.label}>At Least</div>
      <input
        type="text"
        onChange={changeValidationArg}
        data-arg="minValue"
        value={model.validation.args.minValue || ''}
      />
    </div>,
    <div key={1}>
      <div className={styles.label}>No More Than</div>
      <input
        type="text"
        onChange={changeValidationArg}
        data-arg="maxValue"
        value={model.validation.args.maxValue || ''}
      />
    </div>,
  ]
}
