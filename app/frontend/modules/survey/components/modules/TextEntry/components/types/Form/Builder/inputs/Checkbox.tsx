import React from 'react'
import { Checkbox as BaseCheckbox } from 'antd'
import styles from '../../FormStyle.less'

interface Props {
  name: string
}

const Checkbox: React.FC<Props> = ({ name }) => (
  <BaseCheckbox
    className={styles.formCheckbox}
    name={name}
  />
)

export default Checkbox
