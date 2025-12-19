import {
  Avatar,
  Flex, Typography,
} from 'antd'
import { Bubble } from '@ant-design/x'
import { CheckCircleFilled } from '@ant-design/icons'
import { BotIcon } from './BotIcon'
import styles from './styles.less'

export const InterviewCompleted = () => (
  <Bubble
    placement="start"
    variant="outlined"
    shape="round"
    styles={{ body: { width: '90%' } }}
    content={(
      <Flex vertical justify="center" align="center" className={styles.completedBubble}>
        <CheckCircleFilled style={{ fontSize: 60, color: 'var(--success-color)' }} />
        <Typography.Title level={4}>Interview Completed</Typography.Title>
        <Typography.Text>Thank you for competing the audio interview!</Typography.Text>
        <Typography.Text>We are making your Interview Insight Summary. Give us few seconds…</Typography.Text>
      </Flex>
    )}
    avatar={<Avatar icon={<BotIcon />} />}
  />
)
