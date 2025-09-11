import {
  Card, Button,
  Flex, Space, Typography, Divider,
} from 'antd'
import { Bubble, Attachments } from '@ant-design/x'
import { CheckOutlined, CloseOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { BotIcon } from './BotIcon'
import styles from './styles.less'

const { I18n } = window

export const Summary = ({
  message, data, isCurrent, onAction,
}) => (
  <Bubble
    placement="start"
    variant="outlined"
    shape="round"
    styles={{ content: { width: '90%' } }}
    avatar={{ icon: <BotIcon /> }}
    content={(
      <Flex vertical justify="center" className={styles.completedBubble} gap={12}>
        <Flex justify="space-between">
          <Typography.Paragraph>
            {message}
          </Typography.Paragraph>
        </Flex>
        <Divider />
        <Typography.Title level={3}>{I18n.t('idp.ai.summary.chat_title')}</Typography.Title>
        <Card className={styles.card}>
          <Typography.Paragraph>
            {data.chatSummary}
          </Typography.Paragraph>
        </Card>
        <Card className={styles.card} styles={{ body: { width: '100%' } }}>
          <Flex justify="space-between" flex={1}>
            <Space>
              <Button style={{ borderColor: '#dbdbdb' }} size="small">{I18n.t('idp.ai.summary.view_chat')}</Button>
            </Space>
          </Flex>
        </Card>
        <Divider />
        <Flex justify="space-between">
          <Typography.Title level={3}>{I18n.t('idp.ai.summary.file_title')}</Typography.Title>
        </Flex>
        <Card className={styles.card}>
          <Typography.Paragraph>
            {data.documentSummary}
          </Typography.Paragraph>
        </Card>
        <Card className={styles.card} styles={{ body: { width: '100%' } }}>
          <Flex vertical justify="space-between" flex={1}>
            <Typography.Text strong>{I18n.t('idp.ai.summary.upload_file')}</Typography.Text>
            <Attachments.FileCard item={{ uid: '123', name: 'File uploaded.pdf' }} />
          </Flex>
        </Card>
        <Divider />
        <Flex vertical justify="center" align="center" gap={16} className={styles.completionBubble}>
          <Flex vertical justify="center" align="center">
            <Typography.Text strong style={{ margin: 0 }}>
              {I18n.t('idp.ai.summary.title')}
            </Typography.Text>
            <Typography.Text strong style={{ margin: 0 }}>
              {I18n.t('idp.ai.summary.hint')}
            </Typography.Text>
          </Flex>
          {isCurrent && (
            <Space size={16}>
              <Button
                style={{ boxShadow: 'none' }}
                onClick={() => onAction('changeAnswers')}
                type="primary"
                size="small"
                danger
                icon={<CloseOutlined />}
              >
                {I18n.t('no')}
              </Button>
              <Button
                style={{ boxShadow: 'none' }}
                onClick={() => onAction('complete')}
                type="primary"
                size="small"
                icon={<CheckOutlined />}
              >
                {I18n.t('yes')}
              </Button>
            </Space>
          )}
        </Flex>
      </Flex>
    )}
  />
)
