import React from 'react'
import { Input, Icon } from 'antd'
import css from './style'

export default function({ rule, add, remove, update }) {
  return (
    <div>
      <Input size='small' className={css.inputField}></Input>
      days, repeated
      <Input size='small' className={css.inputField}></Input>
      times.
      <span>
        <Icon type="minus-circle" onClick={remove} className={css.deleteIcon} />
        <Icon type="plus-circle" onClick={add} className={css.addIcon} />
      </span>
    </div>
  )
}
