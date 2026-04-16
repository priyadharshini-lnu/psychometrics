import { FC, useEffect } from 'react'
import cs from 'classnames'
import { Alert } from 'antd'
import * as Sentry from '@sentry/react'
import styles from './ErrorWarning.less'

const { I18n } = window

type Props = {
  message?: string
  error?: Error
}

const ErrorWarning: FC<Props> = ({ message, error }) => {
  const errorMessage = message || I18n.t('frontend.error_warning')

  useEffect(() => {
    Sentry.captureException(error || new Error(errorMessage))
  }, [error, errorMessage])

  return (
    <div className={cs(styles.container)}>
      <Alert
        message="Warning"
        description={errorMessage}
        type="warning"
        showIcon
      />
    </div>
  )
}

export default ErrorWarning
