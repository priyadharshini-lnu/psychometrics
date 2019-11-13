import React from 'react'
import styles from 'views/PropertyPanel/components/PropertyPanel.scss'

const NumericFormat = ({ model, changeValidationArg }) => (
  <div>
    <div className={styles.label} style={{ marginBottom: '10px' }}>Numeric Format</div>
    <div className={styles.label}>Maximum</div>
    <input
      type="text"
      onChange={changeValidationArg}
      data-arg="maximum"
      value={model.validation.args.maximum || ''}
    />
    <div className={styles.label}>Maximum</div>
    <input
      type="text"
      onChange={changeValidationArg}
      data-arg="minimum"
      value={model.validation.args.minimum || ''}
    />
    <div className={styles.label}>Max Decimals</div>
    <input
      type="text"
      onChange={changeValidationArg}
      data-arg="maxDecimals"
      value={model.validation.args.maxDecimals || ''}
    />
  </div>
)

export default function Content ({ model, changeValidationArg }) {
  const { type } = model.validation.args
  return (
    <div>
      <div className={styles.label}>Content Type</div>
      <label className={styles.inputLabel}>
        <input
          style={{ marginRight: '3px' }}
          type="radio"
          name="content_type"
          onChange={changeValidationArg}
          data-arg="type"
          checked={type === 'Email'}
          value="Email"
        />
        Email Address
      </label>
      <label className={styles.inputLabel}>
        <input
          style={{ marginRight: '3px' }}
          type="radio"
          name="content_type"
          onChange={changeValidationArg}
          data-arg="type"
          checked={type === 'Date'}
          value="Date"
        />
        Date (mm/dd/yyyy)
      </label>
      <label className={styles.inputLabel}>
        <input
          style={{ marginRight: '3px' }}
          type="radio"
          name="content_type"
          onChange={changeValidationArg}
          data-arg="type"
          checked={type === 'Number'}
          value="Number"
        />
        Number
      </label>
      <label className={styles.inputLabel}>
        <input
          style={{ marginRight: '3px' }}
          type="radio"
          name="content_type"
          onChange={changeValidationArg}
          data-arg="type"
          checked={type === 'Text'}
          value="Text"
        />
        Text Only (No-numbers)
      </label>
      {type === 'Number' && <NumericFormat model={model} changeValidationArg={changeValidationArg} />}
    </div>
  )
}
