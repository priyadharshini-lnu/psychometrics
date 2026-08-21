import { createRef, useEffect } from 'react'
import { PageHeader } from '@ant-design/pro-components'
import {
  Layout,
  Row,
  Col,
  Dropdown,
  Tooltip,
  Progress,
  Button,
  ConfigProvider,
  Space,
  Typography,
  Modal,
  Watermark,
} from 'antd'
import qs from 'qs'

import { connect } from 'react-redux'
import { useParams } from 'react-router-dom'
import { DownOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import userPresenter from '~/presenters/user'
import statusPresenter from '~/presenters/status'
import PassAssessment from '~/modules/survey/containers/AssessmentContainer'
import { statusMenuItems } from '~/modules/endUser/modules/campaigns/common/menuItems'
import { LangDropdownWithChangeUrl } from '~/components/LangDropdown'
import store from '~/modules/endUser/store'
import useAvoidMultipleEvaluation from '~/hooks/useAvoidMultipleEvaluation'
import { validateSession } from '~/modules/endUser/modules/campaigns/core/userAssessment'
import {
  fetchEvaluation, fetchAssessment, clearEvaluation,
  updateStatus,
} from '~/modules/endUser/modules/campaigns/core/evaluation'
import { markAssessmentTimedOut } from '~/modules/survey/core/preview/FlowProcessor/actions'
import { getProgress } from '~/modules/survey/core/preview/FlowProcessor/selectors'
import {
  CountdownTimer, PageHeader as GlintPageHeader, DirectionalNavigateBackIcon, FontsizeModifier,
} from '~/glint'
import { secondsLeftFromNow } from '~/utils/time'
import { ResourcesTabs } from '../../components/ResourcesTabs'
import styles from './Evaluation.less'
import { DocumentTitle } from '~/components/DocumentTitle'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const connector = connect((state: any) => ({
  evaluation: state.campaigns.evaluation,
  preview: state.preview,
  progress: state.preview.initialized && getProgress(state.preview),
  campaignOptions: state.campaigns.campaign.options,
}), {
  fetchEvaluation,
  fetchAssessment,
  clearEvaluation,
  updateStatus,
  markAssessmentTimedOut,
  validateSession,
})
const { Content } = Layout
const { I18n } = window
const { Title } = Typography

const EvaluationComponent = ({
  evaluation: {
    loaded, error, assessment, results,
    results: {
      id,
      user_assessment_id: userAssessmentId,
      subject,
      user,
      is_self: isSelf,
      selected_locale: selectedLanguage,
      available_translations: availableTranslations,
      translations,
      participant: {
        manager_evaluation_status: managerEvaluationStatus,
      },
      expiry_date,
    },
  }, fetchAssessment, clearEvaluation, updateStatus,
  preview: {
    enableProgress,
    type,
    initialized,
    started,
  },
  preview,
  markAssessmentTimedOut,
  progress,
  validateSession,
  campaignOptions: {
    participants: { global: globalParticipantOptions },
  },
}) => {
  const params = useParams()
  const assessmentRef = createRef()
  const {
    edit, step, approve_evaluation, lang, read,
  } = qs.parse(location.search.substr(1))

  useEffect(() => {
    fetchAssessment(params.campaignId, params.id, {
      isEdit: edit, isRead: read, step, approve_evaluation, lang,
    })
    if (edit === 'true') {
      history.replaceState(null, '', location.href.replace('edit=true', 'edit=false'))
    }
  }, [])

  const [showInvalidSession, setShowInvalidSession] = useAvoidMultipleEvaluation(
    params.id, results, validateSession,
  )

  if (!loaded) { return null }

  const handleStatusClick = (status) => {
    updateStatus(params.campaignId, params.id, status)
  }

  const StatusDropdown = () => {
    if (approve_evaluation) {
      return (
        <Dropdown
          trigger={['click']}
          menu={{ items: statusMenuItems, onClick: e => handleStatusClick(e.key) }}
        >
          <Button>
            {statusPresenter.getApprovalStatus(managerEvaluationStatus)}
            <DownOutlined />
          </Button>
        </Dropdown>
      )
    }

    return null
  }

  const titleElement = (
    <Title level={1} className={styles.campaignDropdown}>
      {approve_evaluation ? (
        <>
          {I18n.t('threesixty.subject')}
          :
          {' '}
          <Tooltip placement="topLeft" title={subject.email}>
            {userPresenter.getFullName(subject)}
          </Tooltip>
              &nbsp; &nbsp;
          {I18n.t('threesixty.evaluator')}
          :
          {' '}
          <Tooltip placement="topLeft" title={user.email}>
            {userPresenter.getFullName(user)}
          </Tooltip>
        </>
      ) : (
        <>
          {I18n.t('threesixty.evaluate')}
          :
          {isSelf ? I18n.t('threesixty.yourself') : userPresenter.getFullName(subject)}
        </>
      )
          }

    </Title>
  )


  const handleBackButtonClick = () => {
    clearEvaluation()
    window.location.href = `/threesixty_campaigns/${params.campaignId}`
  }

  if (!loaded || error) { return null }
  return (
    <>
      <DocumentTitle text={`${I18n.t('threesixty.evaluator')} ${I18n.t('threesixty.yourself')}`} />
      <GlintPageHeader>
        <Col flex="auto" className="ta-e">
          <Space>
            <FontsizeModifier />
            {availableTranslations
              && availableTranslations.length > 1
              && (
                <LangDropdownWithChangeUrl
                  currentLocale={selectedLanguage.code}
                  locales={availableTranslations || []}
                />
              )
            }
          </Space>
        </Col>
      </GlintPageHeader>
      <Content className={styles.pageContent}>
        <Watermark
          content={globalParticipantOptions?.showWatermark ? globalParticipantOptions?.watermarkContent : ''}
          font={{ color: 'rgba(0,0,0,0.3)' }}
          gap={[10, 0]}
          rotate={-15}
        >
          <PageHeader
            className={styles.campaignHeader}
            ghost={false}
            title={(
              <Space>
                <Button
                  onClick={handleBackButtonClick}
                  type="text"
                  size="small"
                  aria-label={I18n.t('frontend.aria.back_to_tasks')}
                >
                  <DirectionalNavigateBackIcon
                    className={styles.backIcon}
                  />
                </Button>
                <CountdownTimer
                  notificationPoints={[{ timeRemaining: 3600, type: 'info' },
                    { timeRemaining: 1800, type: 'warning' },
                    { timeRemaining: 900, type: 'error' }]}
                  seconds={secondsLeftFromNow(expiry_date)}
                  onFinish={() => markAssessmentTimedOut(preview)}
                  safeTimer
                />
                {titleElement}
              </Space>
            )}
            extra={[
              type !== 'preview_block' && enableProgress
                && (
                  <Progress
                    key="1"
                    className={styles.progressBar}
                    strokeColor="#fff"
                    percent={progress}
                    style={{ width: '200px' }}
                  />
                ),
            ]}
          />
          {!error && (
            <ConfigProvider direction={selectedLanguage && selectedLanguage.direction}>
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
              <ResourcesTabs assessmentStarted={started} assessment={assessment}>
                <Row justify="end" className={styles.dropdownRow}>
                  <Col className={styles.dropdownCol}>
                    <StatusDropdown />
                  </Col>
                </Row>
                <PassAssessment
                  ref={assessmentRef}
                  id="pass_assessment"
                  initialized={initialized}
                  type={approve_evaluation || read === 'true' ? 'view_results' : 'pass_assessment'}
                  isThreesixty="true"
                  resultsUrl={`/user_assessments/${userAssessmentId}/users_results/${id}`}
                  data={assessment}
                  result={results}
                  dashboardUrl={`/threesixty_campaigns/${params.campaignId}`}
                  locales={translations}
                  selectedLocale={selectedLanguage && selectedLanguage.code}
                  notAnEndPage={approve_evaluation || edit === 'true'}
                  rstore={store}
                  renderedByEnduser
                />
              </ResourcesTabs>
            </ConfigProvider>
          )}
        </Watermark>
      </Content>
    </>
  )
}

export const Evaluation = connector(EvaluationComponent)
