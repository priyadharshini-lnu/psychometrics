import React, { useEffect } from 'react'
import { Button } from 'antd'
import OptionSection from './OptionSection'
import ExpandableOption from './ExpandableOption'
import css from './Options.scss'
import SubjectSection from './SubjectSection'
import ManagerSection from './ManagerSection'
import EvaluatorSection from './EvaluatorSection'

export default function Options ({
  fetchParticipantOptions,
  updateParticipantOptions,
  setCurrentCampaignId,
  options,
  match: {
    params: { campaignId },
  },
}) {
  useEffect(() => {
    setCurrentCampaignId(campaignId)
    fetchParticipantOptions(campaignId)
  }, [])

  function parametersForSwitch (name) {
    return {
      value: options[name],
      onOptionChanged: updateParticipantOptions.bind(this, name),
    }
  }

  return (
    <div className={css.optionContainer}>
      <EvaluatorSection />

      <ManagerSection />

      <SubjectSection />
    </div>
  )
}
