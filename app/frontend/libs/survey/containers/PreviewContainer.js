/* eslint-disable react/no-find-dom-node */
import React, { Component } from 'react'
import { Provider, connect } from 'react-redux'
import ReactDOM from 'react-dom'
import AssessmentPreview from 'layouts/AssessmentPreview'
import Header from 'layouts/AssessmentPreview/Header'
import I18nStore from 'store/I18nStore'
import Watchman from 'store/StoreWatchman'
import 'styles/ant.less'
import styles from 'layouts/Dashboard/Dashboard.scss'
import { INIT } from 'libs/survey/core/preview/FlowProcessor/consts'
import rstore from '../store'

class PreviewContainer extends Component {
  componentDidMount () {
    const parent = ReactDOM.findDOMNode(this).parentNode
    const {
      data, type, locales, isThreesixty, dashboardUrl, selectedLocale, isAnonymousAssessment, langPartial, result,
    } = parent.dataset
    this.langPartial = langPartial
    I18nStore.setLocale(selectedLocale || document.body.dataset.locale)
    if (locales) {
      I18nStore.locales = JSON.parse(locales)
    }

    rstore.dispatch({
      type: INIT,
      data: {
        ...JSON.parse(data),
        type,
        readOnly: type === 'view_results',
        isAnonymousAssessment: isAnonymousAssessment === 'true',
        isThreesixty: isThreesixty === 'true',
        dashboardUrl,
      },
      result: result ? JSON.parse(result) : {},
    })
    Watchman.set(rstore)
    this.forceUpdate()
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
    const Content = connect(({ preview }) => ({ type: preview.type }), {})(
      ({ type }) => (
        <div className="row">
          {type === 'preview_assessment' && <Header langs={this.langPartial} />}
          {/* {AppStore.disabled && this.overlay()} */}
          <AssessmentPreview />
        </div>
      ),
    )

    return (
      <Provider store={rstore}>
        <Content />
      </Provider>
    )
  }
}

export default PreviewContainer
