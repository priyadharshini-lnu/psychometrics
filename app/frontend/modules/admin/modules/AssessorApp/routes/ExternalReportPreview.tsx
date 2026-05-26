import {
  useEffect, FC, useState, lazy, Suspense,
} from 'react'
import { PageHeader } from '@ant-design/pro-components'
import {
  Layout, Button, Row, Col, Spin, Space,
} from 'antd'
import { useParams } from 'react-router-dom'
import { connect, ConnectedProps } from 'react-redux'
import { ArrowLeftOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import Breadcrumb from '~/modules/admin/modules/campaigns/components/Breadcrumb'
import { RootState } from '~/modules/admin/core/rootReducers'
import {
  fetchExternalReportDetails, getExternalReport,
} from '~/modules/admin/modules/AssessorApp/core/userReports'

const PDFViewer = lazy(() => import('~/components/PDFViewer'))

const connecter = connect((state: RootState) => ({
  userReport: getExternalReport(state),
}), {
  fetchExternalReportDetails,
})
export type PropsFromRedux = ConnectedProps<typeof connecter>
type Props = PropsFromRedux

const { Content } = Layout
const { I18n } = window

const ExternalReportPreviewComponent: FC<Props> = ({
  fetchExternalReportDetails, userReport,
}) => {
  const [pdfLoadingComplete, setPdfLoadingComplete] = useState(false)
  const { campaignId, id } = useParams() as { campaignId: string, id: string }
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
              link: () => '/assessors',
              label: () => I18n.t('common.model.campaigns'),
            }, {
              link: () => `/assessors/campaigns/${parsedCampaignId}/users`,
              label: state => state.campaign.name,
            }, {
              link: () => `/assessors/campaigns/${parsedCampaignId}/users/${userReport.userId}`,
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
              <Button href={userReport.pdfUrl} download target="_blank">{I18n.t('common.text.download')}</Button>,
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

export const ExternalReportPreview = connecter(ExternalReportPreviewComponent)
