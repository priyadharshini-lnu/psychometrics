import {
  Button, Flex, Spin,
} from 'antd'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { connect, useSelector } from 'react-redux'
import { RootState } from '~/modules/endUser/core/rootReducers'
import { SafeHTML } from '~/components/SafeHTML'
import { fetchUserIdpPlan } from '~/modules/endUser/modules/campaigns/core/idp/userIdpPlan'
import IdpPageLayoutWrapper from '~/components/IdpShared/IdpPageLayoutWrapper'
import styles from './AIStartPage.less'

const { I18n } = window

const connector = connect((state: RootState) => ({
  skillGapReportAvailable: state.campaigns.idp.skillGapReportAvailable,
}), { fetchUserIdpPlan })

export const AIStartPageComponent = ({ fetchUserIdpPlan, skillGapReportAvailable }) => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const currentUser = useSelector((state: RootState) => state.currentUser)
  const introMessage = useSelector((state: RootState) => state.campaigns.idp.introMessage)

  useEffect(() => {
    fetchUserIdpPlan(currentUser.id).finally(() => setIsLoading(false))
  }, [])

  const handleNext = () => {
    if (skillGapReportAvailable) {
      navigate('/idp/ai_assistant/skill_gap_report')
    } else {
      navigate('/idp/ai_assistant/chat')
    }
  }

  return (
    <IdpPageLayoutWrapper style={{ overflowY: 'auto' }}>
      {isLoading ? <Flex flex={1} align="center" justify="center"><Spin size="large" /></Flex>
        : (
          <Flex vertical className="ms-4 me-4">
            <Flex vertical align="center" justify="center" className="ta-c">
              <section className={styles.contentContainer}>
                <SafeHTML html={introMessage} config="adminRichText" />
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
            {/* <BoxWithShadow className={styles.box}>
              <Flex justify="center" align="center" vertical>
                <Typography.Title>{I18n.t('idp.ai.start_page.title')}</Typography.Title>
                <Typography.Text>
                  {I18n.t('idp.ai.start_page.sub_title')}
                </Typography.Text>
              </Flex>
              <Flex gap={16}>
                <Flex flex={1}>
                  <Card classNames={{ body: styles.card }}>
                    <Flex vertical gap={4} flex={1}>
                      <Typography.Title level={4}>{I18n.t('idp.ai.start_page.one_click.title')}</Typography.Title>
                      <Typography.Text>
                        {I18n.t('idp.ai.start_page.one_click.description')}
                      </Typography.Text>
                      <Flex>
                        <CheckCircleOutlined />
                        {' '}
                        {I18n.t('idp.ai.start_page.one_click.option_1')}
                      </Flex>
                      <Flex>
                        <CheckCircleOutlined />
                        {' '}
                        {I18n.t('idp.ai.start_page.one_click.option_2')}
                      </Flex>
                      <Flex>
                        <CheckCircleOutlined />
                        {' '}
                        {I18n.t('idp.ai.start_page.one_click.option_3')}
                      </Flex>

                    </Flex>
                    <Button
                      className={styles.button}
                      block
                      type="primary"
                      onClick={() => navigate('/idp/ai_assistant/chat')}
                    >
                      {I18n.t('idp.ai.start_page.one_click.button')}
                    </Button>
                  </Card>
                </Flex>
                <Flex flex={1}>
                  <Card classNames={{ body: styles.card }}>
                    <Flex vertical gap={4} flex={1}>
                      <Typography.Title level={4}>{I18n.t('idp.ai.start_page.ai_assisted.title')}</Typography.Title>
                      <Typography.Text>
                        {I18n.t('idp.ai.start_page.ai_assisted.description')}
                      </Typography.Text>
                      <Flex>
                        <CheckCircleOutlined />
                        {' '}
                        {I18n.t('idp.ai.start_page.ai_assisted.option_1')}
                      </Flex>
                      <Flex>
                        <CheckCircleOutlined />
                        {' '}
                        {I18n.t('idp.ai.start_page.ai_assisted.option_2')}
                      </Flex>
                      <Flex>
                        <CheckCircleOutlined />
                        {' '}
                        {I18n.t('idp.ai.start_page.ai_assisted.option_3')}
                      </Flex>

                    </Flex>
                    <Button className={styles.button} block onClick={() => navigate('/idp/ai_assistant/chat')}>
                      {I18n.t('idp.ai.start_page.one_click.button')}
                    </Button>
                  </Card>
                </Flex>
                <Space />
              </Flex>
            </BoxWithShadow> */}
          </Flex>
        )
      }
    </IdpPageLayoutWrapper>
  )
}

export const AIStartPage = connector(AIStartPageComponent)
