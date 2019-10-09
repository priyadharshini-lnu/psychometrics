import React, { useEffect } from 'react'
import OptionSection from 'admin/core/threeSixtyCampaign/components/common/Options/Section'
import Option from 'admin/core/threeSixtyCampaign/components/common/Options/Expandable'

import styles from './styles.scss'

function Options ({
  options,
  fetch,
  update,
  match: {
    params: { campaignId },
  },
}) {
  useEffect(() => {
    fetch(campaignId)
  }, [])

  const parametersForSwitch = name => ({
    value: options[name],
    onOptionChanged: value => update(name, value),
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
