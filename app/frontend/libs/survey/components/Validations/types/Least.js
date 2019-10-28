import React from 'react'
import styles from 'views/PropertyPanel/components/PropertyPanel.scss'

export default function Least ({ model, changeValidationArg }) {
  return (
    <div>
      <div className={styles.label}>At Least</div>
      <input
        type="text"
        onChange={changeValidationArg}
        data-arg="minValue"
        value={model.validation.args.minValue || ''}
      />
    </div>
  )
}
