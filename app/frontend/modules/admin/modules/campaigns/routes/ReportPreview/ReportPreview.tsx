import React, { useEffect } from 'react'
import cs from 'classnames'
import {
  Layout, Button, Row, Col, PageHeader, Spin, Space, message, Affix,
} from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import Report from 'modules/reports/report'
import Breadcrumb from 'modules/admin/modules/campaigns/components/Breadcrumb'
import { RouteComponentProps } from 'react-router-dom'
import { PropsFromRedux } from './connect'
import Sidebar from './Sidebar'
import styles from './styles.less'

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
  features, asyncDownload, clearUseReportDetails,
}: Props) {
  const parsedCampaignId = parseInt(campaignId, 10)
  const parsedId = parseInt(id, 10)

  useEffect(() => {
    fetchReport(parsedCampaignId, parsedId)

    return () => {
      clearUseReportDetails()
    }
  }, [])

  const reportIsLoaded = (): boolean | undefined => (userReport && userReport.loaded)

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
        locales={locales}
        selectedLocale={defaultLanguage}
        userReport={userReport}
        showOverrides={report.require_approval}
      />
    )
  }

  const onReportDownloadClick = () => {
    if (features.url_to_pdf_lambda) {
      asyncDownload(parsedCampaignId, parsedId)
      message.success(I18n.t('user_reports.messages.async_generation'))
    } else {
      download(parsedCampaignId, parsedId)
    }
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
              onClick={onReportDownloadClick}
              loading={downloadInProgress}
              disabled={downloadInProgress}
              key="download"
            >
              {I18n.t('common.text.download')}
            </Button>,
          ]}
        >
          {userReport.richEditorOpened && <div key="editor" id="froala-editor-toolbar" />}
          <Row justify="space-between" style={{ border: '1px solid #ccc' }}>
            <Col flex={1}>
              <Row justify="center">
                <Col>
                  <div className="reportContainer">
                    {renderReportPreview()}
                  </div>
                </Col>
              </Row>
            </Col>
            {userReport.report.require_approval
              && (
              <Col>
                <Affix style={{ maxHeight: '100vh', overflow: 'scroll' }}>
                  <Sidebar />
                </Affix>
              </Col>
              )
            }
          </Row>
        </PageHeader>
      </Content>
    </Layout>
  )
}
