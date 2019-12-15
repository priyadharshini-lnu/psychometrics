import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Socket from 'cable'
import AppStore from 'store/AppStore'
import Header from '../Header'
import styles from './Dashboard.scss'
import '../../styles/core.scss'

export class Dashboard extends Component {
  static propTypes = {
    children: PropTypes.node,
  }

  componentDidMount () {
    Socket.setProvider('Assessment')
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
    const { children } = this.props
    return (
      <div className="col-md-12">
        <div className="panel panel-default">
          <Header />
          <div className={`panel-body ${styles.mainContainer}`}>
            {!AppStore.loaded && this.loading()}
            {AppStore.disabled && this
              .overlay()}
            {children}
          </div>
        </div>
        <div className="clearfix" />
      </div>
    )
  }
}

export default Dashboard
