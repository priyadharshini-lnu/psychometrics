/* eslint-disable react/no-find-dom-node */
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { ConfigProvider } from 'antd'
import AssessmentPreview from 'layouts/AssessmentPreview'
import Header from 'layouts/AssessmentPreview/Header'
import { setStore } from 'store/StoreWatchman'
import styles from 'layouts/Dashboard/Dashboard.scss'
import { INIT } from 'modules/survey/core/preview/FlowProcessor/consts'
import 'utils/i18n'

class AssessmentContainer extends Component {
  componentDidMount () {
    const {
      data, type, locales, isThreesixty, resultsUrl, dashboardUrl,
      langPartial, result, selectedLocale, isAnonymousAssessment, rstore,
      notAnEndPage,
    } = this.props

    this.langPartial = langPartial
    this.type = type

    const dbResult = result || null
    // store.resultLocalStorageKey = [`${store.isThreesixty ? 'users_result' : 'assign'}/${dbResult.id}`]
    // store.init(data, type, dbResult, rstore)

    rstore.dispatch({
      type: INIT,
      data: {
        ...data,
        locale: selectedLocale || document.body.dataset.locale,
        locales,
        type,
        readOnly: type === 'view_results',
        dataSheetColumns: data.data_sheet_columns || [],
        isThreesixty: isThreesixty === 'true',
        isAnonymousAssessment: isAnonymousAssessment === 'true',
        resultsUrl,
        dashboardUrl,
        notAnEndPage,
      },
      result: dbResult,
    })
    setStore(rstore)
  }

  componentWillUnmount () {
    // store.reset()
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
    const { disabled, selectedLocale } = this.props
    return (
      <ConfigProvider direction={selectedLocale === 'ar' ? 'rtl' : 'ltr'}>
        <div className="ant-row">
          {this.type === 'preview_assessment' && <Header langs={this.langPartial} />}
          {disabled && this.overlay()}
          <AssessmentPreview />
        </div>
      </ConfigProvider>
    )
  }
}

export default connect(state => ({ disabled: state.preview.disabled }), {})(AssessmentContainer)
