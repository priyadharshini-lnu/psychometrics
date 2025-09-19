import {
  Space, Button, Flex, Typography, Card,
} from 'antd'
import { useNavigate } from 'react-router-dom'
import { CheckCircleOutlined } from '@ant-design/icons'
import { BoxWithShadow } from '~/glint'
import IdpPageLayoutWrapper from '~/components/IdpShared/IdpPageLayoutWrapper'
import styles from './AIStartPage.less'

export const AIStartPage = () => {
  const navigate = useNavigate()
  return (
    <IdpPageLayoutWrapper>
      <BoxWithShadow className={styles.box}>
        <Flex justify="center" align="center" vertical>
          <Typography.Title>Create Your Individual Development Plan</Typography.Title>
          <Typography.Text>
            Let&apos;s create a customized upskilling jorney mapped to your career aspiration and guided by AI
          </Typography.Text>
        </Flex>
        <Flex gap={16}>
          <Flex flex={1}>
            <Card classNames={{ body: styles.card }}>
              <Flex vertical gap={4} flex={1}>
                <Typography.Title level={4}>1-Click AI IDP</Typography.Title>
                <Typography.Text>
                  AI does all the heavy lifting - instantly scanning your
                  data and generating a complete development plan.
                </Typography.Text>
                <Flex>
                  <CheckCircleOutlined />
                  {' '}
                  Fastest Option (5 minutes)
                </Flex>
                <Flex>
                  <CheckCircleOutlined />
                  {' '}
                  Good for busy professionals
                </Flex>
                <Flex>
                  <CheckCircleOutlined />
                  {' '}
                  Fully editable after generation
                </Flex>

              </Flex>
              <Button className={styles.button} block type="primary" onClick={() => navigate('/idp/ai_assistant/chat')}>
                One click AI IDP
              </Button>
            </Card>
          </Flex>
          <Flex flex={1}>
            <Card classNames={{ body: styles.card }}>
              <Flex vertical gap={4} flex={1}>
                <Typography.Title level={4}>AI-Assisted IDP</Typography.Title>
                <Typography.Text>
                  An interactive conversation-driven flow where you co-create the plan with AI in multiple steps.
                </Typography.Text>
                <Flex>
                  <CheckCircleOutlined />
                  {' '}
                  More personalized results
                </Flex>
                <Flex>
                  <CheckCircleOutlined />
                  {' '}
                  Self-reflection opportunities
                </Flex>
                <Flex>
                  <CheckCircleOutlined />
                  {' '}
                  Better for career transitions
                </Flex>

              </Flex>
              <Button className={styles.button} block onClick={() => navigate('/idp/ai_assistant/chat')}>
                One click AI IDP
              </Button>
            </Card>
          </Flex>
          <Space />
        </Flex>
      </BoxWithShadow>
    </IdpPageLayoutWrapper>
  )
}
