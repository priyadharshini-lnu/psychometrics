import {
  Button,
} from 'antd'
import { useLocation, useHistory } from 'react-router-dom'
import { CheckCircleFilled } from '@ant-design/icons'
import styles from './Form.less'

const { I18n } = window

export const SuccessPage = () => {
  const history = useHistory()
  const location = useLocation()

  const next = () => {
    history.push(location.pathname.replace(/(\/add_invite|\/new)$/, ''))
  }

  return (
    <div className={styles.success}>
      <CheckCircleFilled className={styles.icon} size={40} />
      <div className={styles.message}>
        {I18n.t('administration.assessment_center.invite.success.message')}
      </div>
      <div>
        <Button type="primary" onClick={next}>
          {I18n.t('administration.assessment_center.invite.success.continue')}
        </Button>
      </div>
    </div>
  )
}
