import { Bubble } from '@ant-design/x'
import { Avatar } from 'antd'
import { AudioRecorder } from '../components/AudioRecorder'
import { BotIcon } from './BotIcon'
import styles from './styles.less'

const { I18n } = window

export const AudioQuestion = ({
  message: { num, question }, onAction, isCurrent, status,
}) => (
  <Bubble
    variant="borderless"
    classNames={{ content: styles.audioBubble }}
    content={(
      <AudioRecorder
        question={question}
        isCurrent={isCurrent}
        num={num}
        footer={(
          <div>
            {I18n.t('idp.ai.bubbles.audio.question_progress', { current: num, count: 5 })}
          </div>
        )}
        onAction={onAction}
        chatStatus={status}
      />
    )}
    avatar={<Avatar icon={<BotIcon />} />}
  />
)
