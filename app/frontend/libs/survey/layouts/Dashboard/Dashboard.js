import React, { Component } from 'react'
import PropTypes from 'prop-types'
import AppStore from 'store/AppStore'
import Home from 'views/Home'
import Trash from 'views/Trash'
import PropertyPanel from 'views/PropertyPanel'
import Library from 'libs/library'
import Header from '../Header'
import styles from './Dashboard.scss'
import Modals from 'components/Modals'

import '../../styles/core.scss'

export class Dashboard extends Component {
  static propTypes = {
    children: PropTypes.node,
  }

  componentDidMount () {
    const { subscribeSocket, socketInitialized } = this.props
    if (!socketInitialized) {
      const urldata = location.pathname.match(/assessments\/(\d+)/)
      const id = urldata && urldata[1]
      subscribeSocket('Assessments::Channel', { assessment_id: id })
    }
    this.appListener = AppStore.addListener('change', () => this.forceUpdate())
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
