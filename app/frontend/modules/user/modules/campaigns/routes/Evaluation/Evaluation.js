import React, { useEffect } from 'react'
import {
  Layout, Row, Col, Menu, Dropdown, PageHeader, Tooltip, Progress, Button, ConfigProvider, Space,
} from 'antd'
import { DownOutlined, ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons'
import qs from 'qs'
import userPresenter from 'presenters/user'
import statusPresenter from 'presenters/status'
import PassAssessment from 'modules/survey/containers/AssessmentContainer'
import { isRtl } from 'utils/locales'
import './styles.less'
import { secondsLeftFromNow } from 'utils/time'
import Language from '../../components/Language'
import store from '../../../../store'
import { Timer } from '../../components/Timer'
import ResourcesTabs from '../../components/ResourcesTabs'

const { Content } = Layout
const { I18n } = window

export default function Evaluation ({
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
}) {
  const assessmentRef = React.createRef()
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

  const StatusMenu = () => (
    <Menu onClick={(e) => {
      handleStatusClick(e.key)
    }}
    >
      <Menu.Item key="approved">
        Approved
      </Menu.Item>
      <Menu.Item key="waiting">
        Waiting
      </Menu.Item>
      <Menu.Item key="denied">
        Denied
      </Menu.Item>
    </Menu>
  )

  const StatusDropdown = () => {
    if (approve_evaluation) {
      return (
        <Dropdown
          trigger={['click']}
          overlay={StatusMenu}
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

  const title = () => {
    if (approve_evaluation) {
      return (
        <div>
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
        </div>
      )
    }

    return (
      <div>
        {I18n.t('threesixty.evaluate')}
        :
        {isSelf ? I18n.t('threesixty.yourself') : userPresenter.getFullName(subject)}
      </div>
    )
  }

  const handleBackButtonClick = () => {
    clearEvaluation()
    window.location.href = `/threesixty_campaigns/${params.campaignId}`
  }

  if (!loaded || error) { return null }
  const rtl = isRtl(I18n.uiLocale)
  return (
    <Layout>
      <div className="page-header-wrap">
        <Content className="fluid-container">
          <PageHeader
            className="page-header"
            backIcon={(
              <Space>
                {rtl ? <ArrowRightOutlined /> : <ArrowLeftOutlined />}
                {` ${I18n.t('assessments.page.back')}`}
              </Space>
            )}
            title={title()}
            onBack={handleBackButtonClick}
            extra={[
              type !== 'preview_block' && enableProgress
                && (<Progress key="1" percent={progress} style={{ width: '200px' }} />),
              <Timer
                key="2"
                notification
                seconds={secondsLeftFromNow(expiry_date)}
                onFinish={() => markAssessmentTimedOut(preview)}
              />,
            ]}
          />
        </Content>
      </div>
      <Content className="fluid-container">
        <div className="evaluation-container">
          <Row type="flex" justify="end" className="mtm mrm">
            <Col flex="none">
              <StatusDropdown />
            </Col>
            {availableTranslations && availableTranslations.length > 1 && (
              <Col flex="none">
                <div className="mlm">
                  <Language
                    selectedLanguage={selectedLanguage}
                    availableTranslations={availableTranslations || []}
                  />
                </div>
              </Col>
            )}
          </Row>
          {!error && (
            <ConfigProvider direction={selectedLanguage && selectedLanguage.direction}>
              <ResourcesTabs assessmentStarted={started} assessment={assessment}>
                <div className={selectedLanguage ? selectedLanguage.direction : ''}>
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
                  />
                </div>
              </ResourcesTabs>
            </ConfigProvider>
          )}
        </div>
      </Content>
    </Layout>
  )
}
