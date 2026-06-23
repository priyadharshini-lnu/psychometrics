import {
  Button,
} from 'antd'
import { useNavigate } from 'react-router-dom'
import { CheckCircleFilled } from '~/glint/icons/AccessibleIconsAntDesign'
import styles from './Form.less'

const { I18n } = window

export const SuccessPage = () => {
  const navigate = useNavigate()

  const next = () => {
    navigate('..', { relative: 'path' })
  }

  return (
    <div className={styles.success}>
      <CheckCircleFilled className={styles.icon} size={40} />
      <div className={styles.message}>
        {I18n.t('admin.invite_success_message')}
      </div>
      <div>
        <Button type="primary" onClick={next}>
          {I18n.t('shared.continue')}
        </Button>
      </div>
    </div>
  )
}
