import React from 'react'
import { InputNumber, Icon } from 'antd'
import styles from './styles.scss'

export default function ReminderRule ({
  rule, add, remove, update,
}) {
  return (
    <div>
      <InputNumber
        size="small"
        className={styles.inputField}
        min={1}
        value={rule.days}
        onChange={(value) => {
          update('days', value)
        }}
      />
      {I18n.t('administration.threesixty_campaigns.email_templates.days_repeated')}
      <InputNumber
        size="small"
        className={styles.inputField}
        min={1}
        value={rule.times}
        onChange={(value) => {
          update('times', value)
        }}
      />
      {I18n.t('administration.threesixty_campaigns.email_templates.times')}
      <span>
        <Icon type="minus-circle" onClick={remove} className={styles.deleteIcon} />
        <Icon type="plus-circle" onClick={add} className={styles.addIcon} />
      </span>
    </div>
  )
}
