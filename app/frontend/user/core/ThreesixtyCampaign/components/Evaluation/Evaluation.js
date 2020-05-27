import React, { useEffect } from 'react'
import {
  Layout, Row, Col, Menu, Dropdown, PageHeader, Tooltip, Progress, Tabs,
} from 'antd'
import { DownOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import qs from 'qs'
import userPresenter from 'presenters/userPresenter'
import statusPresenter from 'presenters/statusPresenter'
import PassAssessment from 'libs/survey/containers/AssessmentContainer'
import './styles.scss'
import cs from 'classnames'
import Language from '../common/Language'
import store from '../../../../store'
import Timer from '../Timer'
import Resources from '../Resources'

const { Content } = Layout
const { TabPane } = Tabs

export default function Evaluation ({
  evaluation: {
    loaded, error, assessment, results,
    results: {
      id,
      subject,
      user,
      is_self: isSelf,
      selected_locale: selectedLanguage,
      available_translations: availableTranslations,
      translations,
      participant: {
        manager_evaluation_status: managerEvaluationStatus,
      },
    },
  }, fetchAssessment, clearEvaluation, updateStatus,
  match: { params },
  history,
  preview: {
    enableProgress,
    type,
  },
  preview,
  saveResults,
  block,
  progress,
}) {
  const assessmentRef = React.createRef()
  const {
    edit, step, approve_evaluation, lang,
  } = qs.parse(location.search)

  useEffect(() => {
    fetchAssessment(params.campaignId, params.id, {
      isEdit: edit, step, approve_evaluation, lang,
    })
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
          <div>
            {statusPresenter.getApprovalStatus(managerEvaluationStatus)}
            <DownOutlined />
          </div>
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
    history.push(`/campaigns/${params.campaignId}`)
  }

  if (!loaded || error) { return null }

  return (
    <Layout>
      <div className="page-header-wrap">
        <Content className="fluid-container">
          <PageHeader
            className="page-header"
            backIcon={(
              <div>
                <ArrowLeftOutlined />
                {' '}
                Back to tasks
              </div>
            )}
            title={title()}
            onBack={handleBackButtonClick}
            extra={[
              type !== 'preview_block' && enableProgress
                && (<Progress key="1" percent={progress} style={{ width: '200px' }} />),
              <Timer key="2" preview={preview} saveResults={saveResults} />,
            ]}
          />
        </Content>
      </div>
      <Content className={
          cs('fluid-container', _.get(block, ['props', 'staticContent']) && 'has-static-content', 'main-container')
        }
      >
        <div className="evaluation-container">
          <Row justify="end">
            <Col flex="none">
              <StatusDropdown />
            </Col>
            {availableTranslations && availableTranslations.length > 0 && (
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
            <Tabs defaultActiveKey="assessment" className="tabs-row">
              <TabPane tab="Assessment" key="assessment">
                <div className={selectedLanguage ? selectedLanguage.direction : ''}>
                  <PassAssessment
                    ref={assessmentRef}
                    id="pass_assessment"
                    type={approve_evaluation ? 'view_results' : 'pass_assessment'}
                    isThreesixty="true"
                    resultsUrl={`/campaigns/${params.campaignId}/users_results/${id}`}
                    data={assessment}
                    result={results}
                    dashboardUrl={`/campaigns/${params.campaignId}`}
                    locales={translations}
                    selectedLocale={selectedLanguage && selectedLanguage.code}
                    notAnEndPage={approve_evaluation || edit === 'true'}
                    rstore={store}
                  />
                </div>
              </TabPane>
              <TabPane tab="Resource Content" key="resources">
                <Resources assessment={assessment} />
              </TabPane>
            </Tabs>
          )}
        </div>
      </Content>
    </Layout>
  )
}
