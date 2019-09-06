import React from 'react'
import { Switch } from 'antd'
import { CATEGORIES } from 'constants/emailTemplate'
import css from './style.scss'
import ReminderRules from './ReminderRules'

export default function FooterBar ({ emailTemplate, addReminderRule, removeAllReminderRules }) {
  if (emailTemplate.category !== CATEGORIES.REMINDERS) { return null }

  const reminderRulesExists = emailTemplate.meta.reminderRules && emailTemplate.meta.reminderRules.length

  const handleSwitchChange = (checked) => {
    if (checked) {
      addReminderRule(emailTemplate.id)
    } else {
      removeAllReminderRules(emailTemplate.id)
    }
  }

  return (
    <div className={css.container}>
      <div className={css.titleContainer}>
        <div className={css.title}>
          {I18n.t(`administration.threesixty_campaigns.email_templates.${emailTemplate.name}.rule_name`)}
        </div>
        <div>
          {I18n.t(`administration.threesixty_campaigns.email_templates.${emailTemplate.name}.rule_description`)}
        </div>
      </div>
      <div className={css.switchContainer}>
        <Switch checked={reminderRulesExists} onChange={handleSwitchChange} />
      </div>
      <ReminderRules rules={emailTemplate.meta.reminderRules} selectedEmailTemplateId={emailTemplate.id} />
    </div>
  )
}
