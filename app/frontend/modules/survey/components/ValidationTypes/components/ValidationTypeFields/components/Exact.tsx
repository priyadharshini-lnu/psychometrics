import React, { FC } from 'react'

import styles from 'views/PropertyPanel/components/PropertyPanel.scss'

import { ValidationFieldsProps } from '../interfaces'

const Exact: FC<ValidationFieldsProps> = ({
  model,
  changeValidationArg,
}) => (
  <div>
    <div className={styles.label}>Exactly</div>
    <input
      type="text"
      onChange={changeValidationArg}
      name="exactValue"
      value={model.validation.args.exactValue || ''}
    />
  </div>
)

export default Exact
