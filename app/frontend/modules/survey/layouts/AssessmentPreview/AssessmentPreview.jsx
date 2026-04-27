import { useEffect } from 'react'
import qs from 'qs'
import { useParams, useLocation } from 'react-router-dom'
import Page from '~/modules/survey/views/Preview/Page'
import EndPage from '~/modules/survey/views/Preview/EndPage'
import SubmitPage from '~/modules/survey/views/Preview/SubmitPage'
import SinglePage from '~/modules/survey/views/Preview/SinglePage'
import { Instructions } from '~/modules/survey/views/Preview/Instructions'
import ErrorWarning from '~/modules/survey/views/Preview/ErrorWarning'
import { useUnloadCallback } from '~/hooks/useUnloadCallback'

const InteractiveAssessmentsModule = () => import('@thetalententerprise/interactive-assessments')

const AssessmentPreview = ({
  end, initialized, assessmentCategory, agileAssignUrl, agileAssetsUrl, showSubmitPage, showAsSinglePage,
  started, type, isAnonymousAssessment, showErrorWarning, fixedTimed, instructions, submissionInProgress,
  submissionFailed, submitRequired, defaultLanguage, invalidSession, answersSaved, showEnhanceWithAI,
  preventOverflow, skipInstructions,
}) => {
  const isAgile = () => assessmentCategory === 'agile'
  const { userAssessmentId } = useParams()
  const location = useLocation()

  useEffect(() => {
    isAgile() && initializeAgile()
  }, [])

  const showUnloadCallback = !end && started && !invalidSession && !answersSaved

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
    return <SubmitPage />
  }

  if (!skipInstructions && type !== 'preview_assessment' && !isAnonymousAssessment && !started
    && (fixedTimed || instructions?.enabled)) {
    return <Instructions onBegin={goToAssessment} />
  }

  return (
    end && !submissionInProgress && !submissionFailed ? <EndPage /> : (
      <Page
        defaultLanguage={defaultLanguage}
        showEnhanceWithAI={showEnhanceWithAI}
      />
    )
  )
}

export default AssessmentPreview
