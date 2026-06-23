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
import { protectContent } from '~/utils/contentProtection'
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
    if (initialized) {
      this.toggleContentProtection()
      return null
    }

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

    this.toggleContentProtection()
  }

  componentDidUpdate ({ data: prevData }) {
    const previousCopyEnabled = prevData?.extra?.enable_copy_content
    const { data: currentData } = this.props
    const currentCopyEnabled = currentData?.extra?.enable_copy_content

    if (previousCopyEnabled !== currentCopyEnabled) {
      this.toggleContentProtection()
    }
  }

  componentWillUnmount () {
    this.teardownContentProtection()
    // store.reset()
  }

  isContentCopyEnabled = () => {
    const { data } = this.props
    return data?.extra?.enable_copy_content === true
  }

  setupContentProtection = () => {
    if (!this.containerRef || this.teardownProtection || this.isContentCopyEnabled()) return

    this.teardownProtection = protectContent(() => this.containerRef)
  }

  teardownContentProtection = () => {
    this.teardownProtection?.()
    this.teardownProtection = null
  }

  toggleContentProtection = () => {
    this.teardownContentProtection()
    this.setupContentProtection()
  }

  render () {
    const {
      disabled,
      selectedLocale,
      type,
      showAsSinglePage,
      data,
      renderedByEnduser,
      showEnhanceWithAI = false,
      preventOverflow,
      skipInstructions,
      onSubmit,
      selectiveProctoringEnabled,
      isProctored,
    } = this.props

    const { loading } = this.state
    return (
      <ThemeWrapper
        renderedByEnduser={renderedByEnduser}
      >
        <ErrorBoundary fallbackRender={({ error }) => <ErrorWarning error={error} />}>
          <ConfigProvider direction={selectedLocale === 'ar' ? 'rtl' : 'ltr'}>
            {/* <ConnectionCheck
            onConnected={() => rstore.dispatch(connected())}
            onDisconnected={() => rstore.dispatch(disconnected())}
          /> */}
            {type === 'preview_assessment' && <Header langs={this.langPartial} />}
            <DndProvider backend={HTML5Backend}>
              <div
                ref={(node) => {
                  this.containerRef = node
                }}
                translate="no"
                data-content-protected={this.isContentCopyEnabled() ? undefined : true}
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
                        onSubmit={onSubmit}
                        selectiveProctoringEnabled={selectiveProctoringEnabled}
                        isProctored={isProctored}
                        skipInstructions={skipInstructions}
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
