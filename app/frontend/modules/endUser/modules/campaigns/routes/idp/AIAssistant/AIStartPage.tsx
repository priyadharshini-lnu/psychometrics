import {
  Button, Flex, Typography, Spin,
} from 'antd'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { connect, useSelector } from 'react-redux'
import { RootState } from '~/modules/endUser/core/rootReducers'
import { RocketLaunchIcon } from '~/glint/icons'

import { SafeHTML } from '~/components/SafeHTML'
import { Separator } from '~/components/IdpShared/Separator'
import { fetchUserIdpPlan } from '~/modules/endUser/modules/campaigns/core/idp/userIdpPlan'
import IdpPageLayoutWrapper from '~/components/IdpShared/IdpPageLayoutWrapper'
import styles from './AIStartPage.less'

const { I18n } = window

const LaunchIcon = () => (
  <div className={`${styles.iconContainer} flex justify-center items-center`}>
    <RocketLaunchIcon height="3em" width="3em" />
  </div>
)

const connector = connect(null, { fetchUserIdpPlan })

export const AIStartPageComponent = ({ fetchUserIdpPlan }) => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const currentUser = useSelector((state: RootState) => state.currentUser)
  const introMessage = useSelector((state: RootState) => state.campaigns.idp.introMessage)

  useEffect(() => {
    fetchUserIdpPlan(currentUser.id).finally(() => setIsLoading(false))
  }, [])

  return (
    <IdpPageLayoutWrapper style={{ overflowY: 'auto' }}>
      {isLoading ? <Flex flex={1} align="center" justify="center"><Spin size="large" /></Flex>
        : (
          <Flex vertical>
            <Flex vertical align="center" justify="center" className="ta-c">
              <Flex vertical justify="center" align="center" className="mt-8 mb-4">
                <LaunchIcon />
                <Typography.Title className="mb-0" level={4}>
                  {I18n.t('idp.initial_steps.getting_started')}
                </Typography.Title>
              </Flex>
              <Separator className="mb-4 mt-0" />
              <SafeHTML html={introMessage} config="adminRichText" />
              <Button
                className={styles.button}
                block
                type="primary"
                onClick={() => navigate('/idp/ai_assistant/chat')}
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
