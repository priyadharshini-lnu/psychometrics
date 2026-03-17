import {
  Button, Flex, Spin, Space,
  Typography,
} from 'antd'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState, useContext } from 'react'
import { connect, useSelector } from 'react-redux'
import { RootState } from '~/modules/endUser/core/rootReducers'
import { SafeHTML } from '~/components/SafeHTML'
import { fetchUserIdpPlan } from '~/modules/endUser/modules/campaigns/core/idp/userIdpPlan'
import IdpPageLayoutWrapper from '~/components/IdpShared/IdpPageLayoutWrapper'
import styles from './AIStartPage.less'
import {
  BackButton,
  MediaQueryContext,
} from '~/glint'
import { Separator } from '~/components/IdpShared/Separator'

const { I18n } = window

const connector = connect(() => ({

}), { fetchUserIdpPlan })

export const ChatInstructionsComponent = ({ fetchUserIdpPlan }) => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const currentUser = useSelector((state: RootState) => state.currentUser)
  const chatInstructions = useSelector((state: RootState) => state.campaigns.idp.chatInstructions)
  const skillGapReportAvailable = useSelector((state: RootState) => state.campaigns.idp.skillGapReportAvailable)

  const { isMobile } = useContext(MediaQueryContext)

  useEffect(() => {
    fetchUserIdpPlan(currentUser.id).then(({ response }) => {
      if (!response.data.showChatInstructions) {
        navigate('/idp/ai_assistant/start')
      }
    }).finally(() => setIsLoading(false))
  }, [])

  const handleNext = () => {
    navigate('/idp/ai_assistant/chat')
  }

  const handlePrev = () => {
    if (skillGapReportAvailable) {
      navigate('/idp/ai_assistant/skill_gap_report')
    } else {
      navigate('/idp/ai_assistant/start')
    }
  }

  return (
    <IdpPageLayoutWrapper style={{ overflowY: 'auto' }}>
      <section style={{ width: '100%' }} className="ms-4 me-4">
        <Flex gap={8} vertical={isMobile} className="mt-4 mb-4" flex={1}>
          <Space>
            <BackButton
              onPrev={handlePrev}
            />
          </Space>
          <Typography.Title
            className="mb-0 mt-0"
            level={4}
          >
            {I18n.t('enduser.chat_instructions')}
          </Typography.Title>
        </Flex>
        <Separator
          className="mb-4 mt-0"
        />
        {isLoading ? <Flex flex={1} align="center" justify="center"><Spin size="large" /></Flex>
          : (
            <Flex vertical className="ms-4 me-4">
              <Flex vertical align="center" justify="center" className="ta-c">
                <section className={styles.contentContainer}>
                  <SafeHTML html={chatInstructions} config="adminRichText" />
                </section>
                <Button
                  className={styles.button}
                  block
                  type="primary"
                  onClick={handleNext}
                  style={{ maxWidth: 300 }}
                >
                  {I18n.t('common.actions.continue')}
                </Button>
              </Flex>
            </Flex>
          )
      }
      </section>
    </IdpPageLayoutWrapper>
  )
}

export const ChatInstructions = connector(ChatInstructionsComponent)
