import React, { FC } from 'react'

import styles from 'views/PropertyPanel/components/PropertyPanel.scss'

import { ValidationFieldsProps } from '../interfaces'

const Most: FC<ValidationFieldsProps> = ({
  model,
  changeValidationArg,
}) => (
  <div>
    <div className={styles.label}>At Most</div>
    <input
      type="text"
      onChange={changeValidationArg}
      name="maxValue"
      value={model.validation.args.maxValue || ''}
    />
  </div>
)

export default Most
