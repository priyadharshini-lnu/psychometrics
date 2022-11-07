import React, { useEffect } from 'react'
import {
  Layout, Button, PageHeader, message, Row, Col, Typography,
} from 'antd'
import { DownloadOutlined } from '@ant-design/icons'
import { connect } from 'react-redux'

import { PageHeader as GlintPageHeader, DirectionalNavigateBackIcon } from 'glint'
import userPresenter from 'presenters/user'
import statusPresenter from 'presenters/status'
import ReportPreview from 'modules/reports/report'
import { fetchReport, updateStatus, downloadReport } from 'modules/endUser/modules/campaigns/core/report'
import styles from './Report.less'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const connector = connect((state: any) => ({
  report: state.campaigns.report,
  options: state.campaigns.report.options.reports,
}),
{
  fetchReport,
  updateStatus,
  downloadReport,
})
const { Content } = Layout
const { I18n } = window
const { Text } = Typography

const ReportComponent = ({
  report: {
    loaded,
    report: {
      default_language: defaultLanguage,
      locales,
    }, report, results, user, campaign, approvalStatus, isSelf,
  }, match: { params }, fetchReport, updateStatus, downloadReport,
  options: { approval: { managerApprovesReports }, access: { disableDownloadReport } }, history,
}) => {
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
    <>
      <GlintPageHeader />
      <Content className={styles.pageContent}>
        <PageHeader
          className={styles.campaignHeader}
          backIcon={(
            <DirectionalNavigateBackIcon
              className={styles.backIcon}
            />
          )}
          title={(
            <Text className={styles.campaignDropdown}>
              {`${I18n.t('threesixty.report_for')} ${userPresenter.getFullNameWithEmail(user)}`}
              <StatusItem
                isSelf={isSelf}
                managerApprovesReports={managerApprovesReports}
                approvalStatus={approvalStatus}
                handleStatusClick={handleStatusClick}
              />
            </Text>
          )}
          ghost={false}
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
        />
        <Row justify="center">
          <Col className={styles.reportContainer} xs={24} lg={22} xl={18} xxl={16}>
            <ReportPreview
              id="threesixty-report"
              data={report}
              results={results}
              campaign={JSON.stringify(campaign)}
              user={JSON.stringify(user)}
              locales={locales}
              selectedLocale={defaultLanguage}
              userReport={{}}
            />
          </Col>
        </Row>
      </Content>
    </>
  )
}

const StatusItem = ({
  isSelf, managerApprovesReports, approvalStatus, handleStatusClick,
}) => {
  if (isSelf || !managerApprovesReports) { return null }

  if (approvalStatus !== 'waiting') {
    return <div>{statusPresenter.getApprovalStatus(approvalStatus)}</div>
  }

  return (
    <div>
      <Button onClick={() => handleStatusClick('approved')} type="primary">{I18n.t('threesixty.approve')}</Button>
      <Button className="mlm" onClick={() => handleStatusClick('denied')} danger>{I18n.t('threesixty.deny')}</Button>
    </div>
  )
}

export const Report = connector(ReportComponent)
