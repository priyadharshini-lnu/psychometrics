import React from 'react'
import { Checkbox as BaseCheckbox } from 'antd'
import styles from '../../FormStyle.less'
import { Question } from '../../interfaces'

interface Props {
  name: string
  model: Question
  index: number
  readOnly: boolean
  onChange: (i: number, value: boolean) => void
  id: string
}

const Checkbox: React.FC<Props> = ({
  onChange, name, model: { result: { answers } }, index, readOnly, id,
}) => (
  <BaseCheckbox
    id={id}
    disabled={readOnly}
    className={styles.formCheckbox}
    name={name}
    checked={!!answers[index].value}
    onChange={({ target: { checked } }): void => onChange(index, checked)}
  />
)

export default Checkbox
