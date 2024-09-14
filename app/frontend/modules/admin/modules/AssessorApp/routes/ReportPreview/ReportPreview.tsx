import { FC, useEffect } from 'react'
import cs from 'classnames'
import { PageHeader } from '@ant-design/pro-layout'
import {
  Layout, Button, Row, Col, Spin, Space, Dropdown, Skeleton,
} from 'antd'
import { connect, ConnectedProps } from 'react-redux'
import { ArrowLeftOutlined, DownOutlined } from '@ant-design/icons'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import Report from '~/modules/reports/report'
import Breadcrumb from '~/modules/admin/modules/campaigns/components/Breadcrumb'
import {
  fetchSingle as fetchReport, getCurrent,
} from '~/modules/admin/modules/AssessorApp/core/userReports'
import { RootState } from '~/modules/admin/core/rootReducers'
import styles from './styles.less'

const { Content } = Layout
const { I18n } = window

const connecter = connect((state: RootState) => ({
  userReport: getCurrent(state),
}), {
  fetchReport,
})

export type PropsFromRedux = ConnectedProps<typeof connecter>
type Props = PropsFromRedux

const ReportPreview: FC<Props> = ({
  userReport, fetchReport,
}) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { campaignId, id } = useParams() as { id: string, campaignId: string }
  const parsedCampaignId = parseInt(campaignId, 10)
  const parsedId = parseInt(id, 10)
  const params = new URLSearchParams(location.search)
  const skipLogic = params.get('skip_logic') === 'true'

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
        locales={locales}
        selectedLocale={defaultLanguage}
        userReport={userReport}
        skipLogic={skipLogic}
      />
    )
  }

  const onChangeView = ({ key }) => {
    params.set('skip_logic', `${key === 'all'}`)
    navigate(`${location.pathname}?${params.toString()}`, { replace: true })
  }

  const { user } = userReport

  if (!userReport.loaded) { return <Skeleton active /> }

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
            <Dropdown
              menu={
                {
                  items: [
                    { key: 'subject', label: I18n.t('common.text.subject') },
                    { key: 'all', label: I18n.t('common.text.all_pages') },
                  ],
                  onClick: onChangeView,
                }}
            >
              <Button>
                <Space>
                  {I18n.t('common.text.view_as')}
                  {skipLogic ? I18n.t('common.text.all_pages') : I18n.t('common.text.subject') }
                  <DownOutlined />
                </Space>
              </Button>
            </Dropdown>,
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
