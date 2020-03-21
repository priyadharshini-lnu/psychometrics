import React, { Component } from 'react'
import 'styles/core.scss'
import Modals from 'components/Modals'
import homeStyles from 'views/Home/components/HomeView.scss'
import blockStyles from 'views/BlockList/components/BlockListView.scss'
import Question from 'views/QuestionCenter/Question'
import PropertyPanel from './PropertyPanel'
import Header from './Header'
import styles from './QuestionCenter.scss'

export class Dashboard extends Component {
  componentDidMount () {
    const { subscribeSocket, socketInitialized } = this.props
    if (!socketInitialized) {
      const urldata = location.pathname.match(/questions\/(\d+)/)
      const id = urldata && urldata[1]
      subscribeSocket('Questions::Channel', { question_id: id })
    }
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
    const { loaded, disabled, question } = this.props
    return (
      <div className="col-md-12">
        <div className="panel panel-default">
          <Header />
          <div className={`panel-body ${styles.mainContainer}`}>
            {!loaded && this.loading()}
            {disabled && this.overlay()}
            <div className={homeStyles.survey}>
              <div className={blockStyles.main} style={{ background: '#fff', borderRight: '1px solid #ccc' }}>
                {question && <Question model={question} />}
              </div>
            </div>
            <PropertyPanel restricted />
            <Modals />
          </div>
        </div>
        <div className="clearfix" />
      </div>
    )
  }
}

export default Dashboard
