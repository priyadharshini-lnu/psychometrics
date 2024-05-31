import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import styles from './Options.less'
import SubjectSection from './SubjectSection'
import ManagerSection from './ManagerSection'
import EvaluatorSection from './EvaluatorSection'
import GlobalSection from './GlobalSection'

function Options ({
  fetchParticipantOptions,
}) {
  const { campaignId } = useParams()
  useEffect(() => {
    fetchParticipantOptions(campaignId)
  }, [])

  return (
    <div className={styles.container}>
      <GlobalSection />

      <EvaluatorSection />

      <ManagerSection />

      <SubjectSection />
    </div>
  )
}

export default Options
