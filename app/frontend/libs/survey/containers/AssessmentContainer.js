/* eslint-disable react/no-find-dom-node */
import React, { Component } from 'react'
import AssessmentPreview from 'layouts/AssessmentPreview'
import Header from 'layouts/AssessmentPreview/Header'
import store from 'store/AssessmentPreviewStore'
// import AppStore from 'store/AppStore'
import I18nStore from 'store/I18nStore'
import styles from 'layouts/Dashboard/Dashboard.scss'

class PreviewContainer extends Component {
  componentDidMount () {
    const {
      data, type, locales, isThreesixty, resultsUrl, dashboardUrl,
      langPartial, result, selectedLocale, isAnonymousAssessment, rstore,
    } = this.props

    this.langPartial = langPartial
    I18nStore.setLocale(selectedLocale || document.body.dataset.locale)
    if (locales) {
      I18nStore.locales = locales
    }
    const dbResult = result || null
    store.isThreesixty = isThreesixty === 'true'
    store.isAnonymousAssessment = isAnonymousAssessment === 'true'
    store.resultsUrl = resultsUrl
    store.resultLocalStorageKey = [`${store.isThreesixty ? 'users_result' : 'assign'}/${dbResult.id}`]
    store.init(data, type, dbResult, dashboardUrl, rstore)
    this.forceUpdate()
    // this.appListener = AppStore.addListener('change', () => this.forceUpdate())
  }

  componentWillUnmount () {
    store.reset()
    // this.appListener.remove()
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
      <div className="row">
        {store.type === 'preview_assessment' && <Header langs={this.langPartial} />}
        {/* {AppStore.disabled && this.overlay()} */}
        <AssessmentPreview />
      </div>
    )
  }
}

export default PreviewContainer
