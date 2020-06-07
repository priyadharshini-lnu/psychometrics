import React from 'react'
import { Checkbox as BaseCheckbox } from 'antd'
import styles from '../../FormStyle.scss'

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
