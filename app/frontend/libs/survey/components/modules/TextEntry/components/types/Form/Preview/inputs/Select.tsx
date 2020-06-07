import React from 'react'
import { Select as BaseSelect } from 'antd'
import Watchman from 'store/StoreWatchman'
import styles from '../../FormStyle.scss'
import { Question } from '../../interfaces'

const { Option } = BaseSelect

const MULTIPLE = 'multiple'

interface Props {
  model: Question
  index: number
  multi?: boolean
  onChange: (i: number, value: string | string[]) => void
}

const Select: React.FC<Props> = ({
  onChange, model, model: { result: { answers }, props: { formTypes } }, index, multi = false,
}) => {
  const type = formTypes[index]
  const { optionList } = type

  return (
    <div className={styles.selectContainer}>
      <BaseSelect
        showArrow
        value={answers[index].value || (multi ? [] : '')}
        onChange={(value: string | string[]): void => onChange(index, value)}
        className={styles.formSelect}
        mode={multi ? MULTIPLE : undefined}
      >
        {optionList?.map((option: string, i: number) => (
          <Option key={i} value={option}>
            {Watchman.I18n().tQuestion(model, `formOptionText${index}_${i}`, { typeIndex: index, i })}
          </Option>
        ))}
      </BaseSelect>
    </div>
  )
}
export default Select
