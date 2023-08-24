import waves from './waves.png'
import styles from './styles.less'

const { I18n } = window

interface Props {
  meetingLink: string,
}

export const MeetingLink: React.FC<Props> = ({ meetingLink }) => (
  <div className={styles.meetingLinkContainer}>
    <img className={styles.meetingLinkImg} src={waves} />
    <div className={styles.meetingLinkAnchor}>
      <a href={meetingLink} target="_blank" rel="noreferrer" className={styles.meetingLink}>
        {I18n.t('campaign.workshops.click_here')}
      </a>
    </div>
  </div>
)
