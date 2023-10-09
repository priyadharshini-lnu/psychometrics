import { useState, useEffect } from 'react'
import cs from 'classnames'
import {
  Layout, Button, Row, Col, PageHeader, Spin, Space, message, Affix, Dropdown, Tag,
} from 'antd'
import { ArrowLeftOutlined, DownOutlined } from '@ant-design/icons'
import { RouteComponentProps, useLocation, useHistory } from 'react-router-dom'
import _ from 'lodash'
import Report from '~/modules/reports/report'
import Breadcrumb from '~/modules/admin/modules/campaigns/components/Breadcrumb'
import { ApprovalStatuses } from '~/modules/admin/modules/campaigns/core/userReports'
import { PropsFromRedux } from './connect'
import Sidebar, { lookUpModules } from './Sidebar'
import styles from './styles.less'

const { Content } = Layout
const { I18n } = window

const TAG_COLORS = {
  not_ready: 'warning',
  pending_qc: 'default',
  qc_in_progress: 'warning',
  qc_completed: 'warning',
  change_requested: 'warning',
  approved: 'success',
}
interface Params {
  projectId: string
  campaignId: string
  id: string
}

type Props = PropsFromRedux & RouteComponentProps<Params>

export default function ReportPreview ({
  userReport,
  match: { params: { campaignId, id } }, fetchReport, download, downloadInProgress,
  features, asyncDownload, clearUseReportDetails, startQC,
  sendToReview, abortQC, approveReport, requestChanges, removeApproval,
}: Props) {
  const [pages, setPages] = useState([])
  const location = useLocation()
  const history = useHistory()

  const params = new URLSearchParams(location.search)

  const parsedCampaignId = parseInt(campaignId, 10)
  const parsedId = parseInt(id, 10)
  const skipLogic = params.get('skip_logic') === 'true'

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
        allowEdit={userReport.approvalStatus === ApprovalStatuses.QCInProgress
          && userReport.permissions.manageQc}
        allowApprove={userReport.approvalStatus === ApprovalStatuses.QCCompleted
          && userReport.permissions.manageApproval}
        skipLogic={skipLogic}
        setPages={setPages}
      />
    )
  }

  const onChangeView = ({ key }) => {
    params.set('skip_logic', `${key === 'all'}`)
    history.replace(`${location.pathname}?${params.toString()}`)
  }

  const onReportDownloadClick = () => {
    if (features.url_to_pdf_lambda) {
      asyncDownload(parsedCampaignId, parsedId)
      message.success(I18n.t('user_reports.messages.async_generation'))
    } else {
      download(parsedCampaignId, parsedId, { skipLogic })
    }
  }

  const actions = () => {
    const menuItems = [
      { key: 'subject', label: I18n.t('common.text.subject') },
      { key: 'all', label: I18n.t('common.text.all_pages') },
    ]
    const actionList = [
      <Dropdown menu={{ items: menuItems, onClick: onChangeView }}>
        <Button>
          <Space>
            {I18n.t('common.text.view_as')}
            {skipLogic ? I18n.t('common.text.all_pages') : I18n.t('common.text.subject') }
            <DownOutlined />
          </Space>
        </Button>
      </Dropdown>,
    ]

    if (userReport.requireApproval) {
      if ((userReport.approvalStatus === ApprovalStatuses.PendingQC
          || userReport.approvalStatus === ApprovalStatuses.ChangeRequested)
          && userReport.permissions.manageQc) {
        actionList.unshift(
          <Button
            type="primary"
            onClick={() => startQC(userReport.campaignId, userReport.id)}
          >
            {I18n.t('administration.report_review.review')}
          </Button>,
        )
      }
      if (userReport.approvalStatus === ApprovalStatuses.QCInProgress && userReport.permissions.manageQc) {
        actionList.unshift(...[
          <Button type="primary" onClick={() => sendToReview(userReport.campaignId, userReport.id)}>
            {I18n.t('administration.report_review.send_for_approve')}
          </Button>,
          <Button type="default" onClick={() => abortQC(userReport.campaignId, userReport.id)}>
            {I18n.t('administration.report_review.abort_qc')}
          </Button>,
        ])
      }
      if (userReport.approvalStatus === ApprovalStatuses.QCCompleted && userReport.permissions.manageApproval) {
        const pageModules = lookUpModules(userReport.report, pages)
        const approved = userReport.moduleOverrides.filter(m => m.approved).length
        const modulesCount = _.reduce(pageModules, (sum, { modules }) => (sum + modules.length), 0)

        actionList.unshift(...[
          <Button
            type="primary"
            disabled={approved !== modulesCount}
            onClick={() => approveReport(userReport.campaignId, userReport.id)}
          >
            {I18n.t('administration.report_review.approve')}
          </Button>,
          <Button type="default" onClick={() => requestChanges(userReport.campaignId, userReport.id)}>
            {I18n.t('administration.report_review.request_changes')}
          </Button>,
        ])
      }
      if (userReport.approvalStatus === ApprovalStatuses.Approved && userReport.permissions.manageApproval) {
        actionList.unshift(
          <Button type="primary" onClick={() => removeApproval(userReport.campaignId, userReport.id)}>
            {I18n.t('administration.report_review.remove_approval')}
          </Button>,
        )
      }
    }

    if (userReport.permissions.download) {
      actionList.push(
        <Button
          onClick={onReportDownloadClick}
          loading={downloadInProgress}
          disabled={downloadInProgress}
          key="download"
        >
          {I18n.t('common.text.download')}
        </Button>,
      )
    }

    return [
      <Tag color={TAG_COLORS[userReport.approvalStatus]}>
        {I18n.t(`administration.report_review.statuses.${userReport.approvalStatus}`)}
      </Tag>,
      ...actionList,
    ]
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
          extra={reportIsLoaded() && actions()}
        >
          {userReport.richEditorOpened && (
            <Affix className={styles.affix}>
              <div className={styles.toolbar} style={{ zIndex: 9999 }} key="editor" id="froala-editor-toolbar" />
            </Affix>
          )}
          <Row justify="space-between" className={styles.reportPreviewBody} gutter={20}>
            <Col flex={1}>
              <Row justify="center">
                <Col>
                  <div className="reportContainer">
                    {renderReportPreview()}
                  </div>
                </Col>
              </Row>
            </Col>
            {userReport.requireApproval
              && (
              <Col>
                <Affix style={{ maxHeight: '100vh' }}>
                  <Sidebar pages={pages} />
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
