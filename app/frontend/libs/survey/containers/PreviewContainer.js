/* eslint-disable react/no-find-dom-node */
import React, { Component } from 'react'
import { Provider, connect } from 'react-redux'
import ReactDOM from 'react-dom'
import AssessmentPreview from 'layouts/AssessmentPreview'
import Header from 'layouts/AssessmentPreview/Header'
import Watchman from 'store/StoreWatchman'
import 'styles/ant.less'
import styles from 'layouts/Dashboard/Dashboard.scss'
import { INIT } from 'libs/survey/core/preview/FlowProcessor/consts'
import { ConfigProvider } from 'antd'
import rstore from '../store'

class PreviewContainer extends Component {
  componentDidMount () {
    const parent = ReactDOM.findDOMNode(this).parentNode
    const {
      data, type, locales, isThreesixty, dashboardUrl, selectedLocale, isAnonymousAssessment, langPartial, result,
      agileAssetsUrl, agileAssignUrl,
    } = parent.dataset
    this.langPartial = langPartial
    this.selectedLocale = selectedLocale || document.body.dataset.locale
    Watchman.set(rstore)
    rstore.dispatch({
      type: INIT,
      data: {
        ...JSON.parse(data),
        type,
        locales: JSON.parse(locales),
        locale: this.selectedLocale,
        readOnly: type === 'view_results',
        isAnonymousAssessment: isAnonymousAssessment === 'true',
        isThreesixty: isThreesixty === 'true',
        dashboardUrl,
        agileAssetsUrl,
        agileAssignUrl,
      },
      result: result ? JSON.parse(result) : {},
    })

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
          <AssessmentPreview />
        </div>
      ),
    )

    return (
      <Provider store={rstore}>
        <ConfigProvider direction={this.selectedLocale === 'ar' ? 'rtl' : 'ltr'}>
          <div className={this.selectedLocale === 'ar' ? 'rtl' : 'ltr'}>
            <Content />
          </div>
        </ConfigProvider>
      </Provider>
    )
  }
}

export default PreviewContainer
