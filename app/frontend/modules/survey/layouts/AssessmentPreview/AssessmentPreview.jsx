import { useEffect } from 'react'
import { Spin } from 'antd'
import { useParams, useLocation } from 'react-router-dom'
import qs from 'qs'
import Page from '~/modules/survey/views/Preview/Page'
import EndPage from '~/modules/survey/views/Preview/EndPage'
import SubmitPage from '~/modules/survey/views/Preview/SubmitPage'
import SinglePage from '~/modules/survey/views/Preview/SinglePage'
import { Instructions } from '~/modules/survey/views/Preview/Instructions'
import ErrorWarning from '~/modules/survey/views/Preview/ErrorWarning'
import { useUnloadCallback } from '~/hooks/useUnloadCallback'

const { I18n } = window

const InteractiveAssessmentsModule = () => import('@thetalententerprise/interactive-assessments')

const AssessmentPreview = ({
  end, initialized, assessmentCategory, agileAssignUrl, agileAssetsUrl, showSubmitPage, showAsSinglePage,
  started, type, isAnonymousAssessment, showErrorWarning, fixedTimed, instructions, submissionInProgress,
  submissionFailed, submitRequired, defaultLanguage, invalidSession, answersSaved, showEnhanceWithAI,
  preventOverflow, skipInstructions, onSubmit, selectiveProctoringEnabled, isProctored,
}) => {
  const isAgile = () => assessmentCategory === 'agile'
  const { userAssessmentId } = useParams()
  const location = useLocation()
  const insideSelectiveProctoringSession = selectiveProctoringEnabled && isProctored

  useEffect(() => {
    isAgile() && initializeAgile()
    if (fixedTimed && !isAgile() && insideSelectiveProctoringSession && !started) {
      window.location.href = `/user_assessments/${userAssessmentId}/begin${location.search}`
    }
  }, [])

  const showUnloadCallback = !end && started && !invalidSession && !answersSaved
  const submitButtonText = insideSelectiveProctoringSession
    ? I18n.t('shared.submit_and_finish_proctoring', { locale: I18n.uiLocale }) : ''

  useUnloadCallback(I18n.t('common.messages.leave_message'), showUnloadCallback)

  const goToAssessment = () => {
    const beginLink = `/user_assessments/${userAssessmentId}/begin${location.search}`
    window.location.href = beginLink
  }

  const { lang } = qs.parse(location.search.substr(1))
  const initializeAgile = () => {
    const appOptions = {
      scale: {
        parent: 'agile-container',
      },
      service: {
        baseURL: agileAssignUrl,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-CSRF-Token': document.querySelector("meta[name='csrf-token']").getAttribute('content'),
        },
      },
      settings: {
        returnURL: '',
        assetsBaseURL: agileAssetsUrl,
        locale: lang,
      },
    }
    InteractiveAssessmentsModule().then(({ InteractiveAssessments }) => {
      InteractiveAssessments.init(appOptions)
    })
  }

  if (!initialized) { return null }

  if (insideSelectiveProctoringSession && !started) { return <Spin fullscreen /> }

  if (isAgile()) {
    return (
      <div>
        <div id="agile-container" />
      </div>
    )
  }

  if (showAsSinglePage) {
    return <SinglePage showEnhanceWithAI={showEnhanceWithAI} preventOverflow={preventOverflow} />
  }

  if (showErrorWarning) {
    return <ErrorWarning />
  }

  if (showSubmitPage || (submitRequired && (submissionInProgress || submissionFailed))) {
    return <SubmitPage onSubmit={onSubmit} submitButtonText={submitButtonText} />
  }

  if (!skipInstructions && type !== 'preview_assessment' && !isAnonymousAssessment && !started
    && (fixedTimed || instructions?.enabled)) {
    return <Instructions onBegin={goToAssessment} />
  }

  return (
    end && !submissionInProgress && !submissionFailed ? (
      <EndPage insideSelectiveProctoringSession={insideSelectiveProctoringSession} />
    ) : (
      <Page
        defaultLanguage={defaultLanguage}
        showEnhanceWithAI={showEnhanceWithAI}
      />
    )
  )
}

export default AssessmentPreview
