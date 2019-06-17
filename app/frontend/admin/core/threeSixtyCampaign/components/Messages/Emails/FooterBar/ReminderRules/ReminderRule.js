import React from 'react'
import { InputNumber, Icon } from 'antd'
import I18n from 'admin/core/common/I18n'
import css from './style.scss'

export default function ({
  rule, add, remove, update,
}) {
  return (
    <div>
      <InputNumber
        size="small"
        className={css.inputField}
        min={1}
        value={rule.days}
        onChange={(value) => {
          update('days', value)
        }}
      />
      {I18n.t('administration.threesixty_campaigns.email_templates.days_repeated')}
      <InputNumber
        size="small"
        className={css.inputField}
        min={1}
        value={rule.times}
        onChange={(value) => {
          update('times', value)
        }}
      />
      {I18n.t('administration.threesixty_campaigns.email_templates.times')}
      <span>
        <Icon type="minus-circle" onClick={remove} className={css.deleteIcon} />
        <Icon type="plus-circle" onClick={add} className={css.addIcon} />
      </span>
    </div>
  )
}
