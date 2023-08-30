import { Button } from 'antd'
import styles from './styles.less'

const { I18n } = window

interface Props {
  meetingLink: string,
}

export const MeetingLink: React.FC<Props> = ({ meetingLink }) => (
  <div className={styles.meetingLinkContainer}>
    <div className={styles.meetingLinkBg} />
    <div className={styles.meetingLinkAnchor}>
      <Button type="link" className={styles.meetingLink} href={meetingLink} target="_blank">
        {I18n.t('campaign.workshops.click_here')}
      </Button>
    </div>
  </div>
)
