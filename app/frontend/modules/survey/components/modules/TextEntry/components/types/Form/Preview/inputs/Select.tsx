import React from 'react'
import { Select as BaseSelect } from 'antd'
import { I18n } from '~/modules/survey/store/StoreWatchman'
import styles from '../../FormStyle.less'
import { Question } from '../../interfaces'

const { Option } = BaseSelect

const MULTIPLE = 'multiple'

interface Props {
  model: Question
  index: number
  multi?: boolean
  readOnly: boolean
  onChange: (i: number, value: string | string[]) => void
  id: string
}

const Select: React.FC<Props> = ({
  onChange, model, model: { result: { answers }, props: { formTypes } }, index, multi = false, readOnly, id,
}) => {
  const type = formTypes[index]
  const { optionList } = type

  return (
    <div className={styles.selectContainer}>
      <BaseSelect
        id={id}
        disabled={readOnly}
        showArrow
        value={answers[index].value || (multi ? [] : '')}
        onChange={(value: string | string[]): void => onChange(index, value)}
        className={styles.formSelect}
        mode={multi ? MULTIPLE : undefined}
        showSearch
        virtual={false} // this is for accessibility
      >
        {Array.isArray(optionList)
          ? optionList.map((option: string, i: number) => (
            (
              <Option key={option} value={option}>
                {I18n().tQuestion(model, `formOptionText${index}_${i}`, { typeIndex: index, i })}
              </Option>
            )
          ))
          : Object.entries(optionList || {}).map(([key], i: number) => (
            <Option key={key} value={key}>
              {I18n().tQuestion(model, `formOptionText${index}_${i}`, { typeIndex: index, i })}
            </Option>
          ))
        }
      </BaseSelect>
    </div>
  )
}
export default Select
