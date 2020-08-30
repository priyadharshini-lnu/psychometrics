import React, { useEffect } from 'react'
import cs from 'classnames'
import {
  Layout, Button, Row, Col, PageHeader, Spin, Space,
} from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import Report from 'modules/reports/report'
import Breadcrumb from 'modules/admin/modules/campaigns/components/Breadcrumb'
import { RouteComponentProps } from 'react-router-dom'
import { PropsFromRedux } from './connect'
import styles from './styles.scss'

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
  match: { params: { campaignId, id } }, fetchReport, download, downloadInProgress,
}: Props) {
  const parsedCampaignId = parseInt(campaignId, 10)
  const parsedId = parseInt(id, 10)

  useEffect(() => {
    fetchReport(parsedCampaignId, parsedId)
  }, [])

  const reportIsLoaded = (): boolean => !!userReport && userReport.loaded

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
      <Content className={cs('fluid-container', styles.container)}>
        <Breadcrumb
          request={{
            fields: ['project', 'campaign', 'client'],
            data: {
              campaignId: parsedCampaignId,
            },
          }}
          crumbs={[{
            link: () => '/administration',
            label: () => I18n.t('administration.clients.tenancies'),
          }, {
            link: state => `/administration/clients/${state.client.id}/projects`,
            label: state => state.client.name,
          }, {
            link: state => `/administration/projects/${state.project.id}/new_campaigns`,
            label: state => state.project.name,
          }, {
            link: state => `/administration/projects/${state.project.id}/new_campaigns/${state.campaign.id}`,
            label: state => state.campaign?.name,
          }, {
            link: state => (reportIsLoaded()
              // eslint-disable-next-line max-len
              ? `/administration/projects/${state.project.id}/new_campaigns/${state.campaign.id}/users/${userReport.user.id}`
              : ''),
            label: () => (reportIsLoaded() ? userReport.user.email : ''),
          }, {
            label: () => (reportIsLoaded() ? userReport.report.name : ''),
          }]}
        />
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
