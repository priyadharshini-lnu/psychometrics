import React, { useEffect } from 'react'
import {
  Layout, Button, PageHeader, message,
} from 'antd'
import { DownloadOutlined } from '@ant-design/icons'
import './styles.scss'
import userPresenter from 'presenters/user'
import statusPresenter from 'presenters/status'
import ReportPreview from 'modules/reports/report'

const { Content } = Layout

export default function Report ({
  report: {
    loaded,
    report: {
      default_language: defaultLanguage,
      locales,
    }, report, results, user, campaign, approvalStatus, isSelf,
  }, match: { params }, fetchReport, updateStatus, downloadReport,
  options: { approval: { managerApprovesReports }, access: { disableDownloadReport } }, history,
}) {
  useEffect(() => {
    fetchReport(params.campaignId, params.id)
  }, [])

  const handleStatusClick = (status) => {
    updateStatus(params.campaignId, params.id, status)
  }

  const requestDownloadReport = (campaignId, userReportId) => {
    downloadReport(campaignId, userReportId, defaultLanguage.code)
      .then(({ response }) => {
        if (response.success) {
          message.success(I18n.t('threesixty.report_generation_in_progress'), 3)
        }
      })
  }

  if (!loaded) { return null }

  return (
    <Layout>
      <Content className="fluid-container">
        <PageHeader
          className="page-header"
          title={(
            <div>
              {`${I18n.t('threesixty.report_for')} ${userPresenter.getFullNameWithEmail(user)}`}
              <StatusItem
                isSelf={isSelf}
                managerApprovesReports={managerApprovesReports}
                approvalStatus={approvalStatus}
                handleStatusClick={handleStatusClick}
              />
            </div>
          )}
          onBack={() => history.push(`/threesixty_campaigns/${params.campaignId}`)}
          extra={!disableDownloadReport && [
            <Button
              key="download"
              icon={<DownloadOutlined />}
              onClick={() => requestDownloadReport(params.campaignId, params.id)}
            >
              {I18n.t('threesixty.download_pdf')}
            </Button>,
          ]}
        >
          <div className="main-container">
            <ReportPreview
              id="threesixty-report"
              data={report}
              results={results}
              campaign={JSON.stringify(campaign)}
              user={JSON.stringify(user)}
              locales={locales}
              selectedLocale={defaultLanguage}
            />
          </div>
        </PageHeader>
      </Content>
    </Layout>
  )
}

function StatusItem ({
  isSelf, managerApprovesReports, approvalStatus, handleStatusClick,
}) {
  if (isSelf || !managerApprovesReports) { return null }

  if (approvalStatus !== 'waiting') {
    return <div>{statusPresenter.getApprovalStatus(approvalStatus)}</div>
  }

  return (
    <div>
      <Button onClick={() => handleStatusClick('approved')} type="primary">Approve</Button>
      <Button className="mlm" onClick={() => handleStatusClick('denied')} type="danger">Deny</Button>
    </div>
  )
}

export { default as Sidebar } from './Sidebar'
