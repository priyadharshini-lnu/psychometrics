import {
  useEffect, FC, useState, lazy, Suspense,
} from 'react'
import { PageHeader } from '@ant-design/pro-components'
import {
  Layout, Button, Row, Col, Spin, Space,
} from 'antd'
import { useParams } from 'react-router-dom'
import { connect, ConnectedProps } from 'react-redux'
import { ArrowLeftOutlined, DownloadOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import Breadcrumb from '~/modules/admin/modules/campaigns/components/Breadcrumb'
import {
  fetchExternalReportDetails, FETCH_EXTERNAL_REPORT_DETAILS, getExternalReport,
} from '~/modules/admin/modules/campaigns/core/userReports'
import { RootState } from '~/modules/admin/core/rootReducers'

import { isRequestInProgress } from '~/core/request'
import { getFeatures } from '~/core/config'

const PDFViewer = lazy(() => import('~/components/PDFViewer'))

const connecter = connect((state: RootState) => ({
  userReport: getExternalReport(state),
  reportLoadingInProgress: isRequestInProgress(state, FETCH_EXTERNAL_REPORT_DETAILS),
  features: getFeatures(state),
}), {
  fetchExternalReportDetails,
})
export type PropsFromRedux = ConnectedProps<typeof connecter>
type Props = PropsFromRedux

const { Content } = Layout
const { I18n } = window

const ExternalReportPreview: FC<Props> = ({
  fetchExternalReportDetails,
  userReport,
  reportLoadingInProgress,
}) => {
  const [pdfLoadingComplete, setPdfLoadingComplete] = useState(false)
  const {
    campaignId,
    id,
  } = useParams() as { campaignId: string, id: string }
  const parsedCampaignId = parseInt(campaignId, 10)
  const parsedUserReportId = parseInt(id, 10)
  useEffect(() => {
    fetchExternalReportDetails(parsedCampaignId, parsedUserReportId)
  }, [])

  return (
    <div>
      <Layout>
        <Content className="fluid-container">
          <Breadcrumb
            request={{
              fields: ['project', 'campaign', 'client'],
              data: {
                campaignId: parsedCampaignId,
              },
            }}
            crumbs={[{
              link: () => '/admin',
              label: () => I18n.t('administration.clients.clients'),
            }, {
              link: state => `/admin/clients/${state.client.id}/projects`,
              label: state => state.client.name,
            }, {
              link: state => `/admin/projects/${state.project.id}/new_campaigns`,
              label: state => state.project.name,
            }, {
              link: state => `/admin/projects/${state.project.id}/new_campaigns/${state.campaign.id}`,
              label: state => state.campaign?.name,
            }, {
              link: state => (reportLoadingInProgress
                ? ''
              // eslint-disable-next-line max-len
                : `/admin/projects/${state.project.id}/new_campaigns/${state.campaign.id}/participants/subjects/${userReport.userId}`
              ),
              label: () => userReport.userEmail,
            }, {
              label: () => userReport.reportName,
            }]}
          />
          <PageHeader
            ghost={false}
            title={(
              <Space>
                <span>{I18n.t('user_reports.preview_report')}</span>
                {!pdfLoadingComplete && <Spin />}
              </Space>
            )}
            className="page-header"
            backIcon={(
              <div>
                <ArrowLeftOutlined />
              </div>
            )}
            extra={userReport.canDownloadReport ? [
              <Button href={userReport.pdfUrl} target="_blank" icon={<DownloadOutlined />}>
                {I18n.t('common.text.download')}
              </Button>,
            ] : []}
          >
            <Row justify="space-between">
              <Col flex={1}>
                <Row justify="center">
                  <Col>
                    {userReport.pdfUrl
                      && (
                        <Suspense fallback={<Spin />}>
                          <PDFViewer
                            fileUrl={`${userReport.pdfUrl}${userReport.pdfUrl.includes('?') ? '&' : '?'}view=true`}
                            onLoadingComplete={() => setPdfLoadingComplete(true)}
                          />
                        </Suspense>
                      )}
                  </Col>
                </Row>
              </Col>
            </Row>

          </PageHeader>
        </Content>
      </Layout>
    </div>
  )
}

export default connecter(ExternalReportPreview)
