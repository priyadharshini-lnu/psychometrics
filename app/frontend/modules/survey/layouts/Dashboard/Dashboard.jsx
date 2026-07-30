import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Spin } from 'antd'
import * as Sentry from '@sentry/react'
import Home from '~/modules/survey/views/Home'
import Trash from '~/modules/survey/views/Trash'
import PropertyPanel from '~/modules/survey/views/PropertyPanel'
import Library from '~/libs/library'
import Modals from '~/modules/survey/components/Modals'
import Header from '../Header'
import styles from './Dashboard.less'

import '~/modules/survey/styles/globals.less'

export const Dashboard = (props) => {
  const {
    disabled,
    disableReason,
    disableMessage,
    fetch,
    init,
    subscribeSocket,
    socketInitialized,
    defaultLocale,
    isLoading,
    enableApp,
    disableApp,
  } = props
  const [loadingAssessment, setLoadingAssessment] = useState(true)

  const [params] = useSearchParams()
  const navigate = useNavigate()

  const currentLocale = params.get('assessmentLang') || defaultLocale

  const showOptions = defaultLocale === currentLocale

  useEffect(() => {
    if (!params.get('assessmentLang') && defaultLocale) {
      navigate(`?assessmentLang=${defaultLocale}`)
    }
  }, [defaultLocale])


  useEffect(() => {
    !loadingAssessment && setLoadingAssessment(true)
    const urldata = location.pathname.match(/assessments\/(\d+)/)
    const id = urldata && urldata[1]
    if (!socketInitialized) {
      subscribeSocket('Assessments::Channel', { assessment_id: id })
    }
    fetch(id, currentLocale)
      .then(({ response }) => {
        init(response)
        enableApp()
      })
      .catch((error) => {
        const message = normalizeErrorMessage(error)
        disableApp({ reason: 'fetch_failed', message })
        Sentry.captureException(error)
      })
      .finally(() => {
        setLoadingAssessment(false)
      })
  }, [currentLocale])

  const disableClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const disableKey = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const overlayMessage = disableMessage || getOverlayMessage(disableReason)

  const overlay = (
    <div onKeyDown={disableKey} onClick={disableClick} className={styles.overlay}>
      <div className="message-box message-box-danger animated fadeIn open" id="message-box-danger">
        <div className="mb-container">
          <div className="mb-middle">
            <div className="mb-title">
              <span className="fa fa-times" />
              {I18n.t('shared.error')}
            </div>
            <div className="mb-content">
              <p>{overlayMessage}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )


  return (
    <Container loadingAssessment={isLoading}>
      <div className="panel panel-default">
        <Header {...props} />
        <div className={`panel-body ${styles.mainContainer}`}>
          {disabled && overlay}
          <Home />
          <PropertyPanel />
          {showOptions ? <Trash /> : null}
          <Modals />
          <Library />
        </div>
      </div>
      <div className="clearfix" />
    </Container>
  )
}

const normalizeErrorMessage = (error) => {
  if (Array.isArray(error) && typeof error[0] === 'string') {
    return error[0]
  }

  if (typeof error?.message === 'string') {
    return error.message
  }

  return null
}

const getOverlayMessage = (disableReason) => {
  if (disableReason === 'connection_lost') {
    return I18n.t('shared.internet_disconnected_message')
  }

  return I18n.t('shared.something_wrong')
}

const Container = ({ loadingAssessment, children }) => {
  if (loadingAssessment) {
    return (
      <Spin size="large" className="col-md-12">
        {children}
      </Spin>
    )
  }
  return (
    <div className="col-md-12">
      {children}
    </div>
  )
}

export default Dashboard
