import { createRef, useEffect } from 'react'
import { PageHeader } from '@ant-design/pro-layout'
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
} from 'antd'
import { DownOutlined } from '@ant-design/icons'
import qs from 'qs'

import { connect } from 'react-redux'
import userPresenter from '~/presenters/user'
import statusPresenter from '~/presenters/status'
import PassAssessment from '~/modules/survey/containers/AssessmentContainer'
import { statusMenuItems } from '~/modules/endUser/modules/campaigns/common/menuItems'
import { LangDropdownWithChangeUrl } from '~/components/LangDropdown'
import store from '~/modules/endUser/store'

import {
  fetchEvaluation, fetchAssessment, clearEvaluation,
  updateStatus,
} from '~/modules/endUser/modules/campaigns/core/evaluation'
import { markAssessmentTimedOut } from '~/modules/survey/core/preview/FlowProcessor/actions'
import { getProgress } from '~/modules/survey/core/preview/FlowProcessor/selectors'
import { CountdownTimer, PageHeader as GlintPageHeader, DirectionalNavigateBackIcon } from '~/glint'
import { secondsLeftFromNow } from '~/utils/time'
import { ResourcesTabs } from '../../components/ResourcesTabs'
import styles from './Evaluation.less'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const connector = connect((state: any) => ({
  evaluation: state.campaigns.evaluation,
  preview: state.preview,
  progress: state.preview.initialized && getProgress(state.preview),
}), {
  fetchEvaluation,
  fetchAssessment,
  clearEvaluation,
  updateStatus,
  markAssessmentTimedOut,
})
const { Content } = Layout
const { I18n } = window
const { Text } = Typography

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
  match: { params },
  preview: {
    enableProgress,
    type,
    initialized,
    started,
  },
  preview,
  markAssessmentTimedOut,
  progress,
}) => {
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
    <Text className={styles.campaignDropdown}>
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

    </Text>
  )


  const handleBackButtonClick = () => {
    clearEvaluation()
    window.location.href = `/threesixty_campaigns/${params.campaignId}`
  }

  if (!loaded || error) { return null }
  return (
    <>
      <GlintPageHeader>
        <Col flex="auto" className="ta-e">
          <Space align="center" size="large" />
          {availableTranslations
              && availableTranslations.length > 1
              && (
              <LangDropdownWithChangeUrl
                currentLocale={selectedLanguage.code}
                locales={availableTranslations || []}
              />
              )
            }
        </Col>
      </GlintPageHeader>
      <Content className={styles.pageContent}>
        <PageHeader
          className={styles.campaignHeader}
          backIcon={(
            <Space>
              <DirectionalNavigateBackIcon
                className={styles.backIcon}
              />
              <CountdownTimer
                notificationPoints={[{ completionPercentage: 30, type: 'info' },
                  { completionPercentage: 15, type: 'warning' },
                  { completionPercentage: 5, type: 'error' }]}
                seconds={secondsLeftFromNow(expiry_date)}
                onFinish={() => markAssessmentTimedOut(preview)}
              />
            </Space>
        )}
          ghost={false}
          title={titleElement}
          onBack={handleBackButtonClick}
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
      </Content>
    </>

  )
}

export const Evaluation = connector(EvaluationComponent)
