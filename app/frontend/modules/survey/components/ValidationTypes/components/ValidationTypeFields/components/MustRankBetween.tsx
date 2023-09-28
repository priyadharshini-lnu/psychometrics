import { FC } from 'react'

import styles from '~/modules/survey/views/PropertyPanel/components/PropertyPanel.less'

import { ValidationFieldsProps } from '../interfaces'

const MustRankBetween: FC<ValidationFieldsProps> = ({ model, changeValidationArg }) => (
  <>
    <div>
      <div className={styles.label}>Must Rank At Least</div>
      <input
        type="text"
        onChange={changeValidationArg}
        name="minValue"
        value={model.validation.args.minValue || ''}
      />
    </div>
    <div>
      <div className={styles.label}>And No More Than</div>
      <input
        type="text"
        onChange={changeValidationArg}
        name="maxValue"
        value={model.validation.args.maxValue || ''}
      />
    </div>
  </>
)

export default MustRankBetween
