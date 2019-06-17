import React from 'react'
import { Switch } from 'antd'
import _ from 'lodash'
import css from './style.scss'
import ReminderRules from './ReminderRules'

export default function ({ emailTemplate, addReminderRule, removeAllReminderRules }) {
  if (emailTemplate.category !== 'reminders') { return null }

  const reminderRulesExists = !_.isEmpty(emailTemplate.meta.reminderRules)

  const handleSwitchChange = (checked) => {
    if (checked) {
      addReminderRule()
    } else {
      removeAllReminderRules()
    }
  }

  return (
    <div className={css.container}>
      <div className={css.titleContainer}>
        <div className={css.title}>{`${emailTemplate.name} Rules`}</div>
        <div>Specify rules for automatically scheduling when an invitation is scheduled</div>
      </div>
      <div className={css.switchContainer}>
        <Switch checked={reminderRulesExists} onChange={handleSwitchChange} />
      </div>
      <ReminderRules />
    </div>
  )
}
