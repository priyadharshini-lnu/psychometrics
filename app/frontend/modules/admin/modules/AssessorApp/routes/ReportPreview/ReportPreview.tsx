import React, { FC, useEffect } from 'react'
import cs from 'classnames'
import {
  Layout, Button, Row, Col, PageHeader, Spin, Space,
} from 'antd'
import { connect, ConnectedProps } from 'react-redux'
import { ArrowLeftOutlined } from '@ant-design/icons'
import Report from 'modules/reports/report'
import Breadcrumb from 'modules/admin/modules/campaigns/components/Breadcrumb'
import { useParams } from 'react-router-dom'
import {
  fetchSingle as fetchReport, getCurrent, download, DOWNLOAD,
} from 'modules/admin/modules/AssessorApp/core/userReports'
import { RootState } from 'modules/admin/core/rootReducers'
import { isRequestInProgress } from 'modules/admin/core/request'
import styles from './styles.scss'

const { Content } = Layout
const { I18n } = window

const connecter = connect((state: RootState) => ({
  userReport: getCurrent(state),
  downloadInProgress: isRequestInProgress(state, DOWNLOAD),
}), {
  fetchReport,
  download,
})

export type PropsFromRedux = ConnectedProps<typeof connecter>
type Props = PropsFromRedux

const ReportPreview: FC<Props> = ({
  userReport, fetchReport, download, downloadInProgress,
}) => {
  const { campaignId, id } = useParams<{ id: string, campaignId: string }>()
  const parsedCampaignId = parseInt(campaignId, 10)
  const parsedId = parseInt(id, 10)

  useEffect(() => {
    fetchReport(parsedCampaignId, parsedId)
  }, [])

  const reportIsLoaded = (): boolean | undefined => (userReport && userReport.loaded)

  const renderReportPreview = () => {
    if (!reportIsLoaded()) { return null }

    const {
      report: {
        default_language: defaultLanguage,
        locales,
      }, report, results, user,
    } = userReport

    return (
      <Report
        data={report}
        results={results}
        campaign={JSON.stringify({})}
        user={JSON.stringify(user)}
        locales={JSON.stringify(locales)}
        selectedLocale={defaultLanguage}
      />
    )
  }

  const { user } = userReport

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
            link: () => '/assessors',
            label: () => I18n.t('common.model.campaigns'),
          }, {
            link: () => `/assessors/campaigns/${parsedCampaignId}/users`,
            label: state => state.campaign.name,
          }, {
            link: () => `/assessors/campaigns/${parsedCampaignId}/users/${user.id}`,
            label: () => user.email,
          }, {
            label: () => userReport.report.name,
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
              key="download"
              onClick={() => download(parsedCampaignId, parsedId)}
              loading={downloadInProgress}
              disabled={downloadInProgress}
            >
              {I18n.t('common.text.download')}
            </Button>,
          ]}
        >
          <Row justify="center">
            <Col>
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

export default connecter(ReportPreview)
