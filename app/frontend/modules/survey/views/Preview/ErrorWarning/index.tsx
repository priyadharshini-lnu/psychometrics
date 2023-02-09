import { FC } from 'react'
import cs from 'classnames'
import { Alert } from 'antd'
import styles from './ErrorWarning.less'

const { I18n } = window

const ErrorWarning: FC<{}> = () => (
  <div className={cs(styles.container)}>
    <Alert
      message="Warning"
      description={I18n.t('frontend.error_warning')}
      type="warning"
      showIcon
    />
  </div>
)

export default ErrorWarning
