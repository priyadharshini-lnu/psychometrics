import React, { useEffect } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import {
  Layout, Card, Progress, Space,
} from 'antd'
import _ from 'lodash'
import { useLocation } from 'react-router-dom'
import cs from 'classnames'
import AssessmentContainer from '~/modules/survey/containers/AssessmentContainer'
import { getProgress } from '~/modules/survey/core/preview/FlowProcessor/selectors'
import { RootState } from '~/modules/admin/core/rootReducers'
import { LangDropdownWithChangeUrl } from '~/components/LangDropdown'
import styles from './styles.less'
import { fetchAssessorAssessment, getAssessorForm, getCurrentAssessorForm } from '../../core/evaluation'

const { I18n } = window
const { Content } = Layout

const connecter = connect((state: RootState, props: {userAssessmentId: number}) => ({
  loaded: state.assessors.evaluation.loaded,
  currentAssessorFormId: getCurrentAssessorForm(state.assessors),
  assessorForm: getAssessorForm(state.assessors.evaluation, props.userAssessmentId),
  preview: state.preview,
  progress: state.preview.initialized && getProgress(state.preview),
}), {
  fetch: fetchAssessorAssessment,
})

interface Props extends ConnectedProps<typeof connecter> {
  userAssessmentId: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  store: any
}

const AssessorAssessment: React.FC<Props> = ({
  fetch,
  store,
  userAssessmentId,
  progress,
  assessorForm,
  currentAssessorFormId,
  preview: {
    enableProgress,
  },
}) => {
  const { search } = useLocation()
  const params = new URLSearchParams(search)
  const edit = params.get('edit')
  const read = params.get('read')
  const lang = params.get('lang')
  useEffect(() => {
    if (+currentAssessorFormId === userAssessmentId) {
      fetch(userAssessmentId, { edit: edit === 'true', read: read === 'true', lang })
    }
    if (edit === 'true') {
      history.replaceState(null, '', location.href.replace('edit=true', 'edit=false'))
    }
  }, [currentAssessorFormId])

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
      loading={!loaded}
      title={_.get(assessorForm, ['assessment', 'name'], 'Loading...')}
      bordered={false}
      bodyStyle={bodyStyles}
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
        {loaded && (
          <AssessmentContainer
            id="pass_assessment"
            initialized={false}
            type={read === 'true' ? 'view_results' : 'pass_assessment'}
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
          />
        )}
      </Content>
    </Card>
  )
}

export default connecter(AssessorAssessment)
