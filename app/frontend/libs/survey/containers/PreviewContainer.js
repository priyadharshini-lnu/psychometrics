/* eslint-disable react/no-find-dom-node */
import React, { Component } from 'react'
import { Provider } from 'react-redux'
import ReactDOM from 'react-dom'
import AssessmentPreview from 'layouts/AssessmentPreview'
import Header from 'layouts/AssessmentPreview/Header'
import store from 'store/AssessmentPreviewStore'
import AppStore from 'store/AppStore'
import I18nStore from 'store/I18nStore'
import styles from 'layouts/Dashboard/Dashboard.scss'
import rstore from '../store'

class PreviewContainer extends Component {
  componentDidMount () {
    store.reset()

    const parent = ReactDOM.findDOMNode(this).parentNode
    const {
      data, type, locales, isThreesixty, resultsUrl, dashboardUrl, selectedLocale, isAnonymousAssessment,
    } = parent.dataset

    this.langPartial = parent.dataset.langPartial
    I18nStore.setLocale(selectedLocale || document.body.dataset.locale)
    if (locales) {
      I18nStore.locales = JSON.parse(locales)
    }
    const dbResult = parent.dataset.result || null
    store.isThreesixty = isThreesixty === 'true'
    store.resultsUrl = resultsUrl
    store.resultLocalStorageKey = [location.pathname]
    store.isAnonymousAssessment = isAnonymousAssessment === 'true'
    store.init(JSON.parse(data), type, JSON.parse(dbResult), dashboardUrl)
    this.forceUpdate()
    this.appListener = AppStore.addListener('change', () => this.forceUpdate())
  }

  componentWillUnmount () {
    this.appListener.remove()
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

  render () {
    return (
      <Provider store={rstore}>
        <div className="row">
          {store.type === 'preview_assessment' && <Header langs={this.langPartial} />}
          {AppStore.disabled && this.overlay()}
          <AssessmentPreview />
        </div>
      </Provider>
    )
  }
}

export default PreviewContainer
