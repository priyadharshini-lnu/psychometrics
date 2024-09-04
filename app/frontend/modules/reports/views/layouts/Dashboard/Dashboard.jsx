import { Component } from 'react'
import { normalize } from 'normalizr'
import { message } from 'antd'
import schema from '~/modules/reports/store/schema'
import Library from '~/libs/library'
import AppStore from '~/modules/reports/store/AppStore'
import Modals from '~/modules/reports/components/modals'
import Prompt from '~/modules/reports/components/Prompt'
import PageEditor from '~/modules/reports/views/PageEditor'
import styles from './Dashboard.less'
import Header from '../Header'

export class Dashboard extends Component {
  componentDidMount () {
    const {
      fetch, init, subscribeSocket, socketInitialized,
    } = this.props
    this.appListener = AppStore.addListener('change', () => this.forceUpdate())
    const urldata = location.pathname.match(/reports\/(\d+)/)
    const id = urldata && urldata[1]

    fetch(id).then(({ response }) => {
      const normalizedData = normalize(response, schema)
      AppStore.init(response)
      init(normalizedData)
    })

    if (!socketInitialized) {
      subscribeSocket('Reports::Channel', { report_id: id })
    }

    message.config({
      getContainer: () => document.getElementById('fixed_header') || document.body,
    })
  }

  componentWillUnmount () {
    this.appListener.remove()
  }

  disableClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  disableKey = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  overlay () {
    return (
      <div onKeyDown={this.disableKey} onClick={this.disableClick} className={styles.overlay}>
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
  }

  loading () {
    return (
      <div onKeyDown={this.disableKey} onClick={this.disableClick} className={styles.loading}>
        <i className={`fa fa-refresh fa-spin fa-fw ${styles.icon}`} />
        <span className={styles.loadingLabel}>Loading...</span>
      </div>
    )
  }

  render () {
    const { reportLoaded } = this.props

    return (
      <div>
        <div>
          <Header />
          <div style={{ position: 'relative' }}>
            <div className={`${styles.mainContainer}`}>
              {!AppStore.loaded && !reportLoaded && this.loading()}
              {/* disable error notification popup */}
              {/* {AppStore.disabled && this.overlay()} */}
              <PageEditor />
              <Prompt />
              <Library />
              <Modals />
            </div>
          </div>
        </div>
        <div className="clearfix" />
      </div>
    )
  }
}

export default Dashboard
