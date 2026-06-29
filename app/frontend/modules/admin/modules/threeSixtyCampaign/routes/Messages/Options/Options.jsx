import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import OptionSection from '~/modules/admin/components/Options/Section'
import Option from '~/modules/admin/components/Options/Expandable'

import styles from './styles.less'

function Options ({
  options,
  fetch,
  update,
}) {
  const { campaignId } = useParams()
  useEffect(() => {
    fetch(campaignId)
  }, [])

  const parametersForSwitch = name => ({
    value: options[name],
    onChange: value => update(name, value),
  })

  return (
    <div className={styles.container}>
      <OptionSection>
        <Option
          label={I18n.t('admin.allow_subjects_to_send_reminders')}
          {...parametersForSwitch('subjectCanSendReminder')}
        />

        <Option
          label={I18n.t('admin.automatically_send_invites')}
          {...parametersForSwitch('sendInviteToNewEvaluator')}
        />
      </OptionSection>
    </div>
  )
}

export default Options
