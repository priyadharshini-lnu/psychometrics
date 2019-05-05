import React, { useEffect } from 'react'
import css from './Options.scss'
import SubjectSection from './SubjectSection'
import ManagerSection from './ManagerSection'
import EvaluatorSection from './EvaluatorSection'

export default function Options ({
  fetchParticipantOptions,
  setCurrentCampaignId,
  match: {
    params: { campaignId },
  },
}) {
  useEffect(() => {
    setCurrentCampaignId(campaignId)
    fetchParticipantOptions(campaignId)
  }, [])

  return (
    <div className={css.optionContainer}>
      <EvaluatorSection />

      <ManagerSection />

      <SubjectSection />
    </div>
  )
}
