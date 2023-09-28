import {
  Button, Space,
} from 'antd'
import { useLocation, useHistory } from 'react-router-dom'
import { CheckCircleFilled } from '@ant-design/icons'
import { Panel } from '~/glint'
import styles from './Form.less'

const { I18n } = window

export const SuccessCreatedPage = ({ next }) => {
  const history = useHistory()
  const location = useLocation()

  const skip = () => {
    history.push(location.pathname.replace(/\/new$/, ''))
  }

  return (
    <Panel title={I18n.t('administration.assessment_center.success.title')}>
      <div className={styles.success}>
        <CheckCircleFilled className={styles.icon} size={40} />
        <div className={styles.message}>
          {I18n.t('administration.assessment_center.success.call_send_invitation')}
        </div>
        <Space>
          <Button onClick={() => skip()}>{I18n.t('administration.assessment_center.success.skip')}</Button>
          <Button type="primary" onClick={() => next()}>{I18n.t('administration.assessment_center.success.ok')}</Button>
        </Space>
      </div>
    </Panel>
  )
}
