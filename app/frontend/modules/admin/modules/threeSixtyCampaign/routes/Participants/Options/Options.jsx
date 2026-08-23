import { useEffect } from 'react'
import { theme } from 'antd'
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
  const { token } = theme.useToken()
  useEffect(() => {
    fetchParticipantOptions(campaignId)
  }, [])

  // The table tabs get their top spacing from TableLayout's header row; this form tab has none of its own.
  return (
    <div className={styles.container} style={{ paddingBlockStart: token.padding }}>
      <GlobalSection />

      <EvaluatorSection />

      <ManagerSection />

      <SubjectSection />
    </div>
  )
}

export default Options
