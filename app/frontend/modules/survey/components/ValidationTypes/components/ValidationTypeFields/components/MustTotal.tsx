import { FC } from 'react'

import styles from '~/modules/survey/views/PropertyPanel/components/PropertyPanel.less'

import { ValidationFieldsProps } from '../interfaces'

const MustTotal: FC<ValidationFieldsProps> = ({
  model,
  changeValidationArg,
}) => (
  <div>
    <div className={styles.label}>Choices Must Total</div>
    <input
      type="text"
      onChange={changeValidationArg}
      name="mustTotal"
      value={model.validation.args.mustTotal || ''}
    />
  </div>
)

export default MustTotal
