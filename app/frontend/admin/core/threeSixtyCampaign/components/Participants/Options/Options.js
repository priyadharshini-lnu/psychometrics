import React, { useEffect } from 'react'
import styles from './Options.scss'
import SubjectSection from './SubjectSection'
import ManagerSection from './ManagerSection'
import EvaluatorSection from './EvaluatorSection'

function Options ({
  fetchParticipantOptions,
  match: {
    params: { campaignId },
  },
}) {
  useEffect(() => {
    fetchParticipantOptions(campaignId)
  }, [])

  return (
    <div className={styles.container}>
      <EvaluatorSection />

      <ManagerSection />

      <SubjectSection />
    </div>
  )
}

export default Options
