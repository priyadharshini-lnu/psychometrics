import React, { useState, useEffect } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import {
  Layout, Card, Progress, Space,
  Button, Modal,
} from 'antd'
import _ from 'lodash'
import { useLocation } from 'react-router-dom'
import cs from 'classnames'
import { useMessageBus } from '~/hooks/useMessageBus'
import AssessmentContainer from '~/modules/survey/containers/AssessmentContainer'
import { getProgress } from '~/modules/survey/core/preview/FlowProcessor/selectors'
import { RootState } from '~/modules/admin/core/rootReducers'
import { LangDropdownWithChangeUrl } from '~/components/LangDropdown'
import styles from './styles.less'
import {
  fetchAssessorAssessment, getAssessorForms, getCurrentAssessorForm,
  AssessorAssessment as AssessorAssessmentType, updateAssessorAssessmentStatus,
} from '../../core/evaluation'
import { MultipleResponseTable } from './MultipleResponseTable'
import { validateSession } from '~/modules/endUser/modules/campaigns/core/userAssessment'
import useAvoidMultipleEvaluation from '~/hooks/useAvoidMultipleEvaluation'

const { I18n } = window
const { Content } = Layout

const connecter = connect((state: RootState) => ({
  loaded: state.assessors.evaluation.loaded,
  currentAssessorFormId: getCurrentAssessorForm(state.assessors),
  assessorForms: getAssessorForms(state.assessors.evaluation),
  preview: state.preview,
  progress: state.preview.initialized && getProgress(state.preview),
}), {
  fetch: fetchAssessorAssessment,
  updateAssessorAssessmentStatus,
  validateSession,
})

interface Props extends ConnectedProps<typeof connecter> {
  userAssessmentId: number
  assessorAssessments: AssessorAssessmentType[]
  allowMultipleResponses: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  store: any
}

const AssessorAssessment: React.FC<Props> = ({
  fetch,
  store,
  userAssessmentId: userAssessmentIdProp,
  progress,
  assessorForms,
  currentAssessorFormId,
  assessorAssessments,
  preview: {
    enableProgress,
  },
  allowMultipleResponses,
  updateAssessorAssessmentStatus,
  validateSession,
}) => {
  const { search } = useLocation()
  const params = new URLSearchParams(search)
  const edit = params.get('edit')
  const read = params.get('read')
  const lang = params.get('lang')
  const assessment = params.get('assessment')

  const [isRead, setRead] = useState(read === 'true')
  const [userAssessmentId, setUserAssessmentId] = useState(
    (allowMultipleResponses && assessorAssessments.length > 1) ? assessment : userAssessmentIdProp,
  )

  const viewAssessment = (id) => {
    const url = new URL(location.href)
    url.searchParams.set('assessment', id)
    history.replaceState(null, '', url.href)
    const assessorAssessment = _.find(assessorAssessments, { id })
    setRead(!!assessorAssessment?.completed_at)
    setUserAssessmentId(id)
  }

  useMessageBus('assessment:finished', (assessmentId) => {
    if (userAssessmentId) {
      updateAssessorAssessmentStatus(assessmentId, +userAssessmentId)
    }
  })

  useEffect(() => {
    if (!userAssessmentId) { return }

    const assessorAssessment = _.find(assessorAssessments, { id: +userAssessmentId })
    if (assessorAssessment && assessorAssessment.assessment_id === +currentAssessorFormId) {
      fetch(+userAssessmentId, { edit: edit === 'true', read: isRead, lang })
    }
    if (edit === 'true') {
      history.replaceState(null, '', location.href.replace('edit=true', 'edit=false'))
    }
  }, [userAssessmentId, currentAssessorFormId])


  const assessorForm = assessorForms[userAssessmentId || 0]

  const [showInvalidSession, setShowInvalidSession] = useAvoidMultipleEvaluation(
    userAssessmentId, assessorForm?.result, validateSession,
  )

  const bodyStyles = {
    padding: 0,
    maxHeight: 'calc((var(--vh, 1vh) * 100) - 204px)',
    overflowY: 'scroll' as const,
  }
  const loaded = !!assessorForm
  if (assessorForm?.result?.selected_locale?.code === 'ar') {
    I18n.uiLocale = assessorForm.result.selected_locale.code
  }

  return (
    <Card
      key={userAssessmentId}
      loading={userAssessmentId ? !loaded : false}
      title={_.get(assessorForm, ['assessment', 'name'], userAssessmentId ? 'Loading...' : 'Select an assessment')}
      variant="borderless"
      styles={{ body: bodyStyles }}
      className={styles.card}
      extra={(
        <Space size="large">
          {enableProgress
          && (<Progress key="1" percent={progress} style={{ width: '200px' }} />)}
          {loaded && (
            <LangDropdownWithChangeUrl
              currentLocale={assessorForm.result.selected_locale.code}
              locales={assessorForm.result.available_translations}
            />
          )}
        </Space>
      )}
    >
      <Content className={cs('fluid-container', assessorForm?.result?.selected_locale?.code === 'ar' ? 'rtl' : 'ltr')}>
        {allowMultipleResponses && (
          !userAssessmentId
            ? <MultipleResponseTable assessorAssessments={assessorAssessments} onView={viewAssessment} />
            : (
              <Button type="link" onClick={() => setUserAssessmentId(null)}>
                {I18n.t('common.actions.back_to_responses')}
              </Button>
            )
        )}
        {showInvalidSession && (
          <Modal
            title={I18n.t('errors.invalid_session_title')}
            open={showInvalidSession}
            cancelText={I18n.t('common.actions.close')}
            okText={I18n.t('common.actions.back_to_dashboard')}
            closable={false}
            mask={{ closable: false }}
            onCancel={() => {
              setShowInvalidSession(false)
            }}
            onOk={() => { window.location.href = '/assessors' }}
            centered
          >
            {I18n.t('assessments.page.invalid_session.description')}
          </Modal>
        )}
        {(!allowMultipleResponses || (allowMultipleResponses && userAssessmentId)) && loaded && (
          <AssessmentContainer
            id="pass_assessment"
            initialized={false}
            type={isRead ? 'view_results' : 'pass_assessment'}
            data={assessorForm.assessment}
            result={assessorForm.result}
            dashboardUrl={`/assessors/campaigns/${_.get(assessorForm, ['result', 'campaign_id'])}/users`}
            resultsUrl={`/assessors/evaluations/${userAssessmentId}/results/${_.get(assessorForm, ['result', 'id'])}`}
            rstore={store}
            selectedLocale={assessorForm.result.selected_locale.code}
            locales={assessorForm.result.translations}
            showScoringOnEndPage
            showQuestionScoring
            isAssessor
            showEnhanceWithAI
          />
        )}
      </Content>
    </Card>
  )
}

export default connecter(AssessorAssessment)
