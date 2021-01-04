/* eslint-disable react/no-find-dom-node */
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { ConfigProvider } from 'antd'
import AssessmentPreview from 'layouts/AssessmentPreview'
import Header from 'layouts/AssessmentPreview/Header'
import { setStore } from 'store/StoreWatchman'
import styles from 'layouts/Dashboard/Dashboard.scss'
import { INIT } from 'modules/survey/core/preview/FlowProcessor/consts'
import ConnectionCheck from 'components/ConnectionCheck'
import { connected, disconnected } from 'core/connection'
import { DndProvider } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import 'styles/ant.less'
import 'styles/core.scss'
import 'utils/i18n'

class AssessmentContainer extends Component {
  componentDidMount () {
    const {
      data, type, locales, isThreesixty, resultsUrl, dashboardUrl,
      langPartial, result, selectedLocale, isAnonymousAssessment, rstore,
      notAnEndPage, initialized,
    } = this.props

    this.langPartial = langPartial

    const dbResult = result || null
    // store.resultLocalStorageKey = [`${store.isThreesixty ? 'users_result' : 'assign'}/${dbResult.id}`]
    // store.init(data, type, dbResult, rstore)
    if (initialized) return null

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
    const {
      disabled, selectedLocale, type, rstore,
    } = this.props
    return (
      <ConfigProvider direction={selectedLocale === 'ar' ? 'rtl' : 'ltr'}>
        <ConnectionCheck
          onConnected={() => rstore.dispatch(connected())}
          onDisconnected={() => rstore.dispatch(disconnected())}
        />
        {type === 'preview_assessment' && <Header langs={this.langPartial} />}
        <DndProvider backend={HTML5Backend}>
          <div className="ant-row">
            {disabled && this.overlay()}
            <AssessmentPreview />
          </div>
        </DndProvider>
      </ConfigProvider>
    )
  }
}

export default connect(state => ({ disabled: state.preview.disabled }), {})(AssessmentContainer)
