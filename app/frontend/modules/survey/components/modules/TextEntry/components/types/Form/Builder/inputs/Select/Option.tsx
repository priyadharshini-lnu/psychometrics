import React from 'react'
import { Typography } from 'antd'
import { CloseOutlined } from '@ant-design/icons'
import styles from '../../../FormStyle.less'

interface Props {
  option: string
  i: number
  removeOption: (i: number) => void
  onEditOption: (i: number, newValue: string) => void
  allowRemoveOption: boolean
}

const Option: React.FC<Props> = ({
  option, i, removeOption, onEditOption, allowRemoveOption,
}) => (
  <div className={styles.menuOption}>
    <Typography.Text
      className={styles.editableOptionText}
      ellipsis
      editable={{
        text: option,
        onChange: newValue => onEditOption(i, newValue),
      }}
    >
      {option}
    </Typography.Text>
    {allowRemoveOption && <CloseOutlined onClick={(): void => removeOption(i)} />}
  </div>
)

export default Option
