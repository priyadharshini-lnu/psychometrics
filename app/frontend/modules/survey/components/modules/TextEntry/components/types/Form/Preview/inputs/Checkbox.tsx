import React from 'react'
import { Checkbox as BaseCheckbox } from 'antd'
import styles from '../../FormStyle.scss'
import { Question } from '../../interfaces'

interface Props {
  name: string
  model: Question
  index: number
  onChange: (i: number, value: boolean) => void
}

const Checkbox: React.FC<Props> = ({
  onChange, name, model: { result: { answers } }, index,
}) => (
  <BaseCheckbox
    className={styles.formCheckbox}
    name={name}
    checked={!!answers[index].value}
    onChange={({ target: { checked } }): void => onChange(index, checked)}
  />
)

export default Checkbox
