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
          label=" Allow subjects to send reminders to evaluators"
          {...parametersForSwitch('subjectCanSendReminder')}
        />

        <Option
          label="Automatically send invites to new evaluators"
          {...parametersForSwitch('sendInviteToNewEvaluator')}
        />
      </OptionSection>
    </div>
  )
}

export default Options
