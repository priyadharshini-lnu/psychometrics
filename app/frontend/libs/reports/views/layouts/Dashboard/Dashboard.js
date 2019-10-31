import React, { Component } from 'react'
import PropTypes from 'prop-types'
import AppStore from 'rb/store/AppStore'
import Header from '../Header'
import styles from './Dashboard.scss'
import 'rb/styles/core.scss'

export class Dashboard extends Component {
  static propTypes = {
    children: PropTypes.node,
  }

  componentDidMount () {
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
      <div>
        <div>
          <Header />
          <div style={{ position: 'relative' }}>
            <div className={`${styles.mainContainer}`}>
              {!AppStore.loaded && this.loading()}
              {/* disable error notification popup */}
              {/* {AppStore.disabled && this.overlay()} */}
              {children}
            </div>
          </div>
        </div>
        <div className="clearfix" />
      </div>
    )
  }
}

export default Dashboard
