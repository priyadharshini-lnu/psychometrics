import React from 'react'
import { Switch } from 'antd'
import _ from 'lodash'
import css from './style'
import ReminderRules from './ReminderRules'
export default function ({ selectedTemplate }) {
  if (selectedTemplate.category !== 'reminders') { return null }

  const reminderRulesExists = !_.isEmpty(selectedTemplate.meta.rules)

  return (
    <div className={css.container}>
      <div className={css.titleContainer}>
        <div className={css.title}>{`${selectedTemplate.name} Rules`}</div>
        <div>Specify rules for automatically scheduling when an invitation is scheduled</div>
      </div>
      <div className={css.switchContainer}>
        <Switch checked={reminderRulesExists} onChange={() =>{}} />
      </div>
      <ReminderRules />
    </div>
  )
}
