

import {
  useNavigate,
} from 'react-router-dom'
import { useSelector } from 'react-redux'
import IdpPageLayoutWrapper from '~/components/IdpShared/IdpPageLayoutWrapper'
import { SkillGapReportStep } from '../InitialSteps/SkillGapReport'
import { RootState } from '~/modules/endUser/core/rootReducers'

export const SkillGapReport = () => {
  const navigate = useNavigate()
  const showChatInstructions = useSelector((state: RootState) => state.campaigns.idp.showChatInstructions)

  const handleNext = () => {
    if (showChatInstructions) {
      navigate('/idp/ai_assistant/chat_instructions')
    } else {
      navigate('/idp/ai_assistant/chat')
    }
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
