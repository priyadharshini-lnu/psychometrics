import { FC } from 'react'
import cs from 'classnames'
import { Alert } from 'antd'
import styles from './ErrorWarning.less'

const { I18n } = window

type Props = {
  message?: string
}

const ErrorWarning: FC<Props> = ({ message }) => (
  <div className={cs(styles.container)}>
    <Alert
      message="Warning"
      description={message || I18n.t('frontend.error_warning')}
      type="warning"
      showIcon
    />
  </div>
)

export default ErrorWarning
