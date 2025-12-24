import { Button, Modal } from 'antd'
import { useNavigate } from 'react-router-dom'
import { CloseCircleOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'
import styles from './styles.less'
import { RequestError } from '~/core/errors'
import { PropsFromRedux } from './connect'

export const CLIENT_ERRORS = ['401', '403']

const { I18n } = window

type Props = PropsFromRedux

export const hasErrorsToHandle = (errors: RequestError[]) => errors?.find(
  error => CLIENT_ERRORS.includes(error.statusCode),
)

const ErrorModal: React.FC<Props> = ({ errors, clearRequestErrors }) => {
  const navigate = useNavigate()

  const statusCode = hasErrorsToHandle(errors.errors)?.statusCode

  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleCancel = () => {
    setIsModalOpen(false)
    clearRequestErrors()
  }

  useEffect(() => {
    if (statusCode) {
      setIsModalOpen(true)
    }
  }, [statusCode])

  const handleNavigation = (type?: 'signin' | 'goback' | 'gohome') => {
    clearRequestErrors()
    if (type === 'signin') {
      window.location.reload()
    } else if (type === 'gohome') {
      navigate('/')
      window.location.reload()
    } else if (type === 'goback') {
      navigate(-1)
    }
  }

  return (
    <Modal
      zIndex={10000000}
      title={(
        <span className={styles.title}>
          <CloseCircleOutlined />
          {I18n.t('errors.error')}
        </span>
      )}
      onCancel={handleCancel}
      open={isModalOpen}
      footer={null}
      centered
      className={styles.modalContainer}
    >
      <div className={styles.container}>
        <p>
          {statusCode === '401' && I18n.t('errors.error_401')}
          {statusCode === '403' && I18n.t('errors.error_403')}
        </p>
        <div className={styles.controls}>
          {statusCode === '401' && (
            <Button
              type="primary"
              onClick={() => handleNavigation('signin')}
              className={styles.btn}
            >
              {I18n.t('common.actions.sign_in')}
            </Button>
          )}
          {statusCode === '403' && (
            <>
              <Button
                onClick={() => handleNavigation('goback')}
                className={styles.btn}
              >
                {I18n.t('common.actions.go_back')}
              </Button>
              <Button
                type="primary"
                onClick={() => handleNavigation('gohome')}
                className={styles.btn}
              >
                {I18n.t('common.actions.return_to_home')}
              </Button>
            </>
          )}
        </div>
      </div>
    </Modal>
  )
}

export default ErrorModal
