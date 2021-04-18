import React, { FC } from 'react'

import styles from 'views/PropertyPanel/components/PropertyPanel.scss'

import { ValidationFieldsProps } from '../interfaces'

const Range: FC<ValidationFieldsProps> = ({
  model,
  changeValidationArg,
}) => (
  <>
    <div>
      <div className={styles.label}>At Least</div>
      <input
        type="text"
        onChange={changeValidationArg}
        name="minValue"
        value={model.validation.args.minValue || ''}
      />
    </div>
    <div>
      <div className={styles.label}>No More Than</div>
      <input
        type="text"
        onChange={changeValidationArg}
        name="maxValue"
        value={model.validation.args.maxValue || ''}
      />
    </div>
  </>
)

export default Range
