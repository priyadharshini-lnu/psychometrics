import React from 'react'
import { CloseOutlined } from '@ant-design/icons'
import styles from '../../../FormStyle.less'

interface Props {
  option: string
  i: number
  removeOption: (i: number) => void
}

const Option: React.FC<Props> = ({ option, i, removeOption }) => (
  <div className={styles.menuOption}>
    <div>{option}</div>
    <CloseOutlined onClick={(): void => removeOption(i)} />
  </div>
)

export default Option
