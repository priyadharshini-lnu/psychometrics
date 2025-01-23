import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
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
    disabled, fetch, init, subscribeSocket, socketInitialized, defaultLocale,
  } = props
  const [loadingAssessment, setLoadingAssessment] = useState(true)

  const [params] = useSearchParams()

  const currentLocale = params.get('lang') || defaultLocale

  const showOptions = defaultLocale === currentLocale


  useEffect(() => {
    !loadingAssessment && setLoadingAssessment(true)
    const urldata = location.pathname.match(/assessments\/(\d+)/)
    const id = urldata && urldata[1]
    if (!socketInitialized) {
      subscribeSocket('Assessments::Channel', { assessment_id: id })
    }
    fetch(id, currentLocale).then(({ response }) => {
      init(response)
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

  const overlay = (
    <div onKeyDown={disableKey} onClick={disableClick} className={styles.overlay}>
      <div className="message-box message-box-danger animated fadeIn open" id="message-box-danger">
        <div className="mb-container">
          <div className="mb-middle">
            <div className="mb-title">
              <span className="fa fa-times" />
              Attention!
            </div>
            <div className="mb-content">
              <p>Something went wrong</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const loading = (
    <div onKeyDown={disableKey} onClick={disableClick} className={styles.loading}>
      <i className={`fa fa-refresh fa-spin fa-fw ${styles.icon}`} />
      <span className={styles.loadingLabel}>Loading...</span>
    </div>
  )

  return (
    <div className="col-md-12">
      <div className="panel panel-default">
        <Header {...props} />
        <div className={`panel-body ${styles.mainContainer}`}>
          {loadingAssessment && loading}
          {disabled && overlay}
          <Home />
          <PropertyPanel />
          {showOptions ? <Trash /> : null}
          <Modals />
          <Library />
        </div>
      </div>
      <div className="clearfix" />
    </div>
  )
}

export default Dashboard
