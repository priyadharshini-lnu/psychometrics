import { useEffect } from 'react'
import { PageHeader } from '@ant-design/pro-components'
import {
  Layout, Button, App, Row, Col, Typography, notification,
  Space,
} from 'antd'
import { connect } from 'react-redux'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { LangDropdownWithChangeUrl } from '~/components/LangDropdown'
import { DownloadOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { SafeHTML } from '~/components/SafeHTML'
import userPresenter from '~/presenters/user'
import statusPresenter from '~/presenters/status'
import ReportPreview from '~/modules/reports/report'
import {
  fetchReport, updateStatus, downloadReport, checkReport,
} from '~/modules/endUser/modules/campaigns/core/report'
import { PageHeader as GlintPageHeader, DirectionalNavigateBackIcon } from '~/glint'
import styles from './Report.less'
import { DocumentTitle } from '~/components/DocumentTitle'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const connector = connect((state: any) => ({
  report: state.campaigns.report,
  options: state.campaigns.report.options.reports,
}),
{
  fetchReport,
  updateStatus,
  downloadReport,
  checkReport,
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
      other_languages: otherLanguages,
      available_languages: availableLanguages,
    }, report, results, user, campaign, approvalStatus, isSelf,
    moduleOverrides, campaignAiArtifactResults,
  },
  fetchReport, updateStatus, downloadReport, checkReport,
  options: { approval: { managerApprovesReports }, access: { disableDownloadReport } },
}) => {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const params = useParams()
  const [searchParams] = useSearchParams()

  const lang = searchParams.get('lang') || searchParams.get('report_lang') || undefined
  useEffect(() => {
    fetchReport(params.campaignId, params.id, lang)
  }, [])

  const handleStatusClick = (status) => {
    updateStatus(params.campaignId, params.id, status)
  }

  const requestDownloadReport = (campaignId, userReportId) => {
    downloadReport(campaignId, userReportId, lang || defaultLanguage.code)
      .then(({ response }) => {
        if (response.success) {
          message.success(I18n.t('threesixty.report_generation_in_progress'), 3)
        }
      })
    const interval = setInterval(() => {
      checkReport(campaignId, userReportId, lang || defaultLanguage.code).then(({ response }) => {
        if (response) {
          clearInterval(interval)
          const config = {
            message: response.message,
            // deepcode ignore DOMXSS: We are using SafeHTML component to sanitize the HTML
            description: <SafeHTML html={response.description} />,
            duration: 0,
          }
          const type = response.type || 'success'
          notification[type](config)
        }
      })
    }, 10000)
  }

  const availableLocales = availableLanguages?.map(l => l.code)

  const extraContent = (
    <>
      {otherLanguages?.length > 0 && (
        <LangDropdownWithChangeUrl
          locales={availableLocales}
          currentLocale={lang || defaultLanguage.code}
          withBg
        />
      )}
      {!disableDownloadReport && [
        <Button
          key="download"
          icon={<DownloadOutlined />}
          onClick={() => requestDownloadReport(params.campaignId, params.id)}
        >
          {I18n.t('threesixty.download_pdf')}
        </Button>,
      ]}
    </>
  )

  if (!loaded) { return null }

  return (
    <>
      <DocumentTitle text={`${I18n.t('threesixty.report_for')} ${userPresenter.getFullNameWithEmail(user)}`} />
      <GlintPageHeader />
      <Content className={styles.pageContent}>
        <PageHeader
          className={styles.campaignHeader}
          title={(
            <Space>
              <Button
                onClick={() => navigate(`/threesixty_campaigns/${params.campaignId}`)}
                type="text"
                size="small"
                aria-label={I18n.t('frontend.aria.back_to_tasks')}
              >
                <DirectionalNavigateBackIcon
                  className={styles.backIcon}
                />
              </Button>
              <Text className={styles.campaignDropdown}>
                {`${I18n.t('threesixty.report_for')} ${userPresenter.getFullNameWithEmail(user)}`}
                <StatusItem
                  isSelf={isSelf}
                  managerApprovesReports={managerApprovesReports}
                  approvalStatus={approvalStatus}
                  handleStatusClick={handleStatusClick}
                />
              </Text>
            </Space>
          )}
          ghost={false}
          extra={extraContent}
        />
        <Row justify="center" className="mt-5">
          <Col className={styles.reportContainer} xs={24} lg={22} xl={18} xxl={16}>
            <ReportPreview
              id="threesixty-report"
              data={report}
              results={results}
              campaign={JSON.stringify(campaign)}
              user={JSON.stringify(user)}
              locales={locales}
              selectedLocale={lang ? { code: lang } : defaultLanguage}
              userReport={{ moduleOverrides, campaignAiArtifactResults }}
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
