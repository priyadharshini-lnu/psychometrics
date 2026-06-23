import {
  Button, Space,
} from 'antd'
import { useNavigate } from 'react-router-dom'
import { CheckCircleFilled } from '~/glint/icons/AccessibleIconsAntDesign'
import { Panel } from '~/glint'
import styles from './Form.less'

const { I18n } = window

export const SuccessCreatedPage = ({ next }) => {
  const navigate = useNavigate()

  const skip = () => {
    navigate('..', { relative: 'path' })
  }

  return (
    <Panel title={I18n.t('admin.success_title')}>
      <div className={styles.success}>
        <CheckCircleFilled className={styles.icon} size={40} />
        <div className={styles.message}>
          {I18n.t('admin.success_call_send_invitation')}
        </div>
        <Space>
          <Button onClick={() => skip()}>{I18n.t('admin.success_skip')}</Button>
          <Button type="primary" onClick={() => next()}>{I18n.t('admin.success_ok')}</Button>
        </Space>
      </div>
    </Panel>
  )
}
