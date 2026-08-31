import { Switch } from 'antd'
import { CATEGORIES } from '~/modules/admin/constants/emailTemplate'
import styles from './styles.less'
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
    <div className={styles.container}>
      <div className={styles.titleContainer}>
        <div className={styles.title}>
          {I18n.t(`admin.${emailTemplate.name}_rule_name`)}
        </div>
        <div>
          {I18n.t(`admin.${emailTemplate.name}_rule_description`)}
        </div>
      </div>
      <div className={styles.switchContainer}>
        <Switch
          checked={reminderRulesExists}
          onChange={handleSwitchChange}
          aria-label={I18n.t('admin.threesixty_campaigns_send_reminders_automatically')}
        />
      </div>
      <ReminderRules rules={emailTemplate.meta.reminderRules} selectedEmailTemplateId={emailTemplate.id} />
    </div>
  )
}
