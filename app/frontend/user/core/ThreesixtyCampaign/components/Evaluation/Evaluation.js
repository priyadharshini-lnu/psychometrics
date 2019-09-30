import React, { useEffect } from 'react'
import {
  Layout, Row, Col, Menu, Dropdown, Icon, PageHeader, Tooltip,
} from 'antd'
import qs from 'query-string'
import userPresenter from 'presenters/userPresenter'
import statusPresenter from 'presenters/statusPresenter'
import './styles.scss'
import Language from '../common/Language'

const { Content } = Layout

export default function Evaluation ({
  evaluation: {
    loaded, error, assessment, results,
    results: {
      id,
      subject,
      user,
      is_self: isSelf,
      as_manager: asManager,
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
}) {
  useEffect(() => {
    if (loaded && !error) {
      window.renderPassAssessment('pass_assessment')
    }
  }, [loaded])

  const {
    edit, step, approveEvaluation, lang,
  } = qs.parse(location.search)

  useEffect(() => {
    fetchAssessment(params.campaignId, params.id, { isEdit: edit, step, lang })
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
    if (approveEvaluation) {
      return (
        <Dropdown
          trigger={['click']}
          overlay={StatusMenu}
        >
          <div>
            {statusPresenter.getApprovalStatus(managerEvaluationStatus)}
            <Icon type="down" />
          </div>
        </Dropdown>
      )
    }

    return null
  }

  const title = () => {
    if (asManager) {
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
        {': '}
        {isSelf ? I18n.t('threesixty.yourself') : userPresenter.getFullName(subject)}
      </div>
    )
  }

  const handleBackButtonClick = () => {
    clearEvaluation()
    history.push(`/campaigns/${params.campaignId}`)
  }

  return (
    <Layout>
      <Content className="fluid-container">
        <PageHeader
          className="page-header"
          backIcon={(
            <div>
              <Icon type="arrow-left" />
              {' '}
              Back to tasks
            </div>
          )}
          title={title()}
          onBack={handleBackButtonClick}
        >
          <div className="evaluation-container">
            <Row type="flex" justify="end">
              <Col>
                <StatusDropdown />
              </Col>
              {availableTranslations && availableTranslations.length > 0 && (
                <Col>
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
              <div className={selectedLanguage ? selectedLanguage.direction : ''}>
                <div
                  id="pass_assessment"
                  data-type={asManager ? 'view_results' : 'pass_assessment'}
                  data-is-threesixty="true"
                  data-results-url={`/campaigns/${params.campaignId}/users_results/${id}`}
                  data-data={JSON.stringify(assessment)}
                  data-result={JSON.stringify(results)}
                  data-locales={JSON.stringify(translations)}
                  data-dashboard-url={`/campaigns/${params.campaignId}`}
                  data-selected-locale={selectedLanguage && selectedLanguage.code}
                />
              </div>
            )}
          </div>
        </PageHeader>
      </Content>
    </Layout>
  )
}
