import { Steps, Typography } from 'antd'
import { MessageOutlined, FileOutlined, AudioOutlined } from '@ant-design/icons'
import cs from 'classnames'
import styles from './AISteps.less'

const Icon = ({ children, className }) => <div className={cs(styles.icon, className)}>{children}</div>

export const AISteps = () => (
  <Steps
    direction="vertical"
    current={1}
    size="small"
    className={styles.steps}
    items={[
      {
        title: <Typography.Text className={styles.title}>Start Chat</Typography.Text>,
        icon: <Icon className={styles.chat}><MessageOutlined className={styles.svg} /></Icon>,
        description: <Typography.Text className={styles.description}>Completed</Typography.Text>,
        status: 'process',
      },
      {
        title: <Typography.Text className={styles.title}>Upload Documents</Typography.Text>,
        icon: <Icon className={styles.doc}><FileOutlined className={styles.svg} /></Icon>,
        status: 'process',
      },
      {
        title: <Typography.Text className={styles.title}>Audio Interview</Typography.Text>,
        icon: <Icon className={styles.audio}><AudioOutlined className={styles.svg} /></Icon>,
        status: 'wait',
      },
    ]}
  />
)
