

import {
  useNavigate,
} from 'react-router-dom'
import IdpPageLayoutWrapper from '~/components/IdpShared/IdpPageLayoutWrapper'
import { SkillGapReportStep } from '../InitialSteps/SkillGapReport'

export const SkillGapReport = () => {
  const navigate = useNavigate()

  const handleNext = () => {
    navigate('/idp/ai_assistant/chat')
  }

  const handlePrev = () => {
    navigate('/idp/ai_assistant/start')
  }
  return (

    <IdpPageLayoutWrapper style={{ overflowY: 'auto' }}>
      <section style={{ width: '100%' }} className="ms-4 me-4">
        <SkillGapReportStep
          next={handleNext}
          prev={handlePrev}
        />
      </section>
    </IdpPageLayoutWrapper>

  )
}
