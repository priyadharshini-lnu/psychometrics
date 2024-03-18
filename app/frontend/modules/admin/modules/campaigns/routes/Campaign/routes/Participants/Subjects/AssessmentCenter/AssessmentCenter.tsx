import {
} from 'antd'
import styles from './AssessmentCenter.less'
import WorkshopList from './WorkshopList'
import WorkshopInviteList from './WorkshopInviteList/WorkshopList'

const { I18n } = window

const AssessmentCenter: React.FC<{}> = () => (
  <div>
    <div>
      <h3>{I18n.t('campaign_users.details.assessment_center')}</h3>
      <WorkshopList />
      <div className={styles.tableDivider} />
      <h3>{I18n.t('campaign_users.details.assessment_center_invites')}</h3>
      <WorkshopInviteList />
    </div>
  </div>
)

export default AssessmentCenter
