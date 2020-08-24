import React, { useEffect } from 'react'
import {
  Layout, Button, Row, Col, PageHeader, Spin, Space,
} from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import Report from 'modules/reports/report'
import './styles'
import { RouteComponentProps } from 'react-router-dom'
import { PropsFromRedux } from './connect'

const { Content } = Layout
const { I18n } = window

interface Params {
  projectId: string
  campaignId: string
  id: string
}

type Props = PropsFromRedux & RouteComponentProps<Params>

export default function ReportPreview ({
  userReport,
  match: { params: { projectId, campaignId, id } }, fetchReport, download, downloadInProgress, history,
}: Props) {
  const parsedCampaignId = parseInt(campaignId, 10)
  const parsedId = parseInt(id, 10)

  useEffect(() => {
    fetchReport(parsedCampaignId, parsedId)
  }, [])

  const reportIsLoaded = (): boolean => !!userReport && userReport.loaded

  const handleOnBackClick = () => {
    reportIsLoaded()
      ? history.push(`/administration/projects/${projectId}/new_campaigns/${campaignId}/users/${userReport.user.id}`)
      : window.history.back()
  }

  const renderReportPreview = () => {
    if (!reportIsLoaded()) { return null }

    const {
      report: {
        default_language: defaultLanguage,
        locales,
      }, report, results, user, campaign,
    } = userReport

    return (
      <Report
        data={report}
        results={results}
        campaign={JSON.stringify(campaign)}
        user={JSON.stringify(user)}
        locales={JSON.stringify(locales)}
        selectedLocale={defaultLanguage}
      />
    )
  }

  return (
    <Layout>
      <Content className="fluid-container">
        <PageHeader
          ghost={false}
          title={(
            <Space>
              <span>{I18n.t('user_reports.preview_report')}</span>
              {!reportIsLoaded() && <Spin />}
            </Space>
          )}
          className="page-header"
          backIcon={(
            <div>
              <ArrowLeftOutlined />
            </div>
          )}
          extra={[
            <Button
              onClick={() => download(parsedCampaignId, parsedId)}
              loading={downloadInProgress}
              disabled={downloadInProgress}
            >
              {I18n.t('common.text.download')}
            </Button>,
          ]}
          onBack={handleOnBackClick}
        >
          <Row justify="center">
            <Col lg={12} md={18} sm={24}>
              <div className="reportContainer">
                {renderReportPreview()}
              </div>
            </Col>
          </Row>
        </PageHeader>
      </Content>
    </Layout>
  )
}
