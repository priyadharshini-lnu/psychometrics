/* eslint-disable react/no-find-dom-node */
import { Component } from 'react'
import { connect } from 'react-redux'
import { ConfigProvider } from 'antd'
import { DndProvider } from 'react-dnd'
import { ErrorBoundary } from 'react-error-boundary'
import HTML5Backend from 'react-dnd-html5-backend'
import AssessmentPreview from '~/modules/survey/layouts/AssessmentPreview'
import Header from '~/modules/survey/layouts/AssessmentPreview/Header'
import { setStore, getStore } from '~/modules/survey/store/StoreWatchman'
import { INIT } from '~/modules/survey/core/preview/FlowProcessor/consts'
// import ConnectionCheck from '~/components/ConnectionCheck'
// import { connected, disconnected } from '~/core/connection'
import containerStyles from './AssessmentContainer.less'
import ErrorWarning from '~/modules/survey/views/Preview/ErrorWarning'
import { DefaultAntThemeWrapper, PageLoadSpinner } from '~/glint'
import '~/modules/survey/styles/globals.less'
import '~/modules/survey/utils/i18n'
import { ParallaxWrapper } from '../components/ParallaxBackground/ParallaxWrapper'
import { RecordingProvider } from '~/context/RecordingContext'

class AssessmentContainer extends Component {
  constructor (props) {
    super()
    this.state = {
      loading: !props.isAssessor && !props.showAsSinglePage && props.status !== 'completed',
    }
  }

  componentDidMount () {
    const {
      data, type, locales, isThreesixty, resultsUrl, dashboardUrl,
      langPartial, result, selectedLocale, isAnonymousAssessment, rstore,
      notAnEndPage, initialized, showScoringOnEndPage, showQuestionScoring,
      isAssessor, evaluationSessionId,
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
        showScoringOnEndPage,
        showQuestionScoring,
        isAssessor,
        evaluationSessionId,
      },
      result: dbResult,
    })
    if (!getStore()) {
      setStore(rstore)
    }
  }

  componentWillUnmount () {
    // store.reset()
  }

  render () {
    const {
      disabled, selectedLocale, type, showAsSinglePage, data, renderedByEnduser, showEnhanceWithAI = false,
      preventOverflow,
    } = this.props

    const { loading } = this.state
    return (
      <ThemeWrapper
        renderedByEnduser={renderedByEnduser}
      >
        <ErrorBoundary fallbackRender={() => <ErrorWarning />}>
          <ConfigProvider direction={selectedLocale === 'ar' ? 'rtl' : 'ltr'}>
            {/* <ConnectionCheck
            onConnected={() => rstore.dispatch(connected())}
            onDisconnected={() => rstore.dispatch(disconnected())}
          /> */}
            {type === 'preview_assessment' && <Header langs={this.langPartial} />}
            <DndProvider backend={HTML5Backend}>
              <div
                translate="no"
                className={containerStyles.previewContainer}
                dir={selectedLocale === 'ar' ? 'rtl' : 'ltr'}
              >
                {disabled && this.overlay()}
                {!showAsSinglePage
                  && <ParallaxWrapper loading={loading} onLoaded={() => { this.setState({ loading: false }) }} />}
                {!loading
                  ? (
                    <RecordingProvider>
                      <AssessmentPreview
                        showEnhanceWithAI={showEnhanceWithAI}
                        showAsSinglePage={showAsSinglePage}
                        type={type}
                        defaultLanguage={data.default_language}
                        preventOverflow={preventOverflow}
                      />
                    </RecordingProvider>
                  )
                  : <div className={containerStyles.loading}><PageLoadSpinner /></div>}
              </div>
            </DndProvider>
          </ConfigProvider>
        </ErrorBoundary>
      </ThemeWrapper>
    )
  }
}

const ThemeWrapper = ({ renderedByEnduser, children }) => (
  renderedByEnduser
    ? <>{children}</> : <DefaultAntThemeWrapper>{children}</DefaultAntThemeWrapper>
)

export default connect(state => ({ disabled: state.preview.disabled }), {})(AssessmentContainer)
