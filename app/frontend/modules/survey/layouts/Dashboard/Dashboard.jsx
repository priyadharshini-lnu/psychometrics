import { Component } from 'react'
import PropTypes from 'prop-types'
import Home from '~/modules/survey/views/Home'
import Trash from '~/modules/survey/views/Trash'
import PropertyPanel from '~/modules/survey/views/PropertyPanel'
import Library from '~/libs/library'
import Modals from '~/modules/survey/components/Modals'
import Header from '../Header'
import styles from './Dashboard.less'

import '~/modules/survey/styles/globals.less'

export class Dashboard extends Component {
  static propTypes = {
    children: PropTypes.node,
  }

  componentDidMount () {
    const {
      fetch, init, subscribeSocket, socketInitialized, resetFlow,
    } = this.props
    if (!socketInitialized) {
      const urldata = location.pathname.match(/assessments\/(\d+)/)
      const id = urldata && urldata[1]
      subscribeSocket('Assessments::Channel', { assessment_id: id })
      fetch(id).then(({ response }) => {
        init(response)
        resetFlow(response.flow)
      })
    }
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
    const { loaded, disabled } = this.props
    return (
      <div className="col-md-12">
        <div className="panel panel-default">
          <Header {...this.props} />
          <div className={`panel-body ${styles.mainContainer}`}>
            {!loaded && this.loading()}
            {disabled && this.overlay()}
            <Home />
            <PropertyPanel />
            <Trash />
            <Modals />
            <Library />
          </div>
        </div>
        <div className="clearfix" />
      </div>
    )
  }
}

export default Dashboard
