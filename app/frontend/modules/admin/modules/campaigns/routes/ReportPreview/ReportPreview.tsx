import { useState, useEffect, useMemo } from 'react'
import cs from 'classnames'
import { PageHeader } from '@ant-design/pro-components'
import {
  Layout, Button, Row, Col, Spin, Space, App, Affix, Dropdown, Tag,
} from 'antd'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import _ from 'lodash'
import { normalize } from 'normalizr'
import { ArrowLeftOutlined, DownOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { LangDropdownWithChangeUrl } from '~/components/LangDropdown'
import Report from '~/modules/reports/report'
import Breadcrumb from '~/modules/admin/modules/campaigns/components/Breadcrumb'
import { ApprovalStatuses } from '~/modules/admin/modules/campaigns/core/userReports'
import { PropsFromRedux } from './connect'
import Sidebar, { lookUpModules } from './Sidebar'
import { camelizeKeys } from '~/utils/object'
import schema from '~/modules/reports/store/schema'
import { isRtl } from '~/utils/locales'
import { AIEditorIcon } from '~/glint/icons/AIEditorIcon'

import styles from './styles.less'
import ReportTranslation from './ReportTranslation'

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

type Params = {
  projectId: string
  campaignId: string
  id: string
}

type Props = PropsFromRedux

export default function ReportPreview ({
  userReport,
  fetchReport,
  download,
  downloadInProgress,
  features,
  asyncDownload,
  clearUseReportDetails,
  startQC,
  sendToReview,
  abortQC,
  approveReport,
  requestChanges,
  removeApproval,
  availableLanguages,
}: Props) {
  const [pages, setPages] = useState([])
  const [showTranslation, setShowTranslation] = useState(false)

  const location = useLocation()
  const navigate = useNavigate()
  const {
    campaignId,
    id,
  } = useParams() as Params
  const { message } = App.useApp()
  const params = new URLSearchParams(location.search)

  const parsedCampaignId = parseInt(campaignId, 10)
  const parsedId = parseInt(id, 10)
  const skipLogic = params.get('skip_logic') === 'true'
  const { urlToPdfFaas: isUrlToPdfFaasFeatureEnabled } = camelizeKeys(features)

  const lang = new URLSearchParams(location.search).get('report_lang') || userReport.report.default_language?.code
  useEffect(() => {
    fetchReport(parsedCampaignId, parsedId, { reportLang: lang })

    return () => {
      clearUseReportDetails()
    }
  }, [])

  const reportIsLoaded = (): boolean | undefined => (userReport && userReport.loaded)

  const renderReportPreview = () => {
    if (!reportIsLoaded() || showTranslation) {
      return null
    }

    const {
      report: {
        default_language: defaultLanguage,
        locales,
      },
      report,
      results,
      user,
      campaign,
    } = userReport

    const selectedLanguage = lang ? {
      code: lang,
      direction: isRtl(lang) ? 'rtl' : 'ltr',
    } : defaultLanguage

    return (
      <Report
        data={report}
        results={results}
        campaign={JSON.stringify(campaign)}
        user={JSON.stringify(user)}
        locales={locales}
        selectedLocale={selectedLanguage}
        userReport={userReport}
        allowEdit={userReport.approvalStatus === ApprovalStatuses.QCInProgress
          && userReport.permissions.editQc}
        allowApprove={userReport.approvalStatus === ApprovalStatuses.QCCompleted
          && userReport.permissions.manageApproval}
        skipLogic={skipLogic}
        setPages={setPages}
      />
    )
  }

  const onChangeView = ({ key }) => {
    params.set('skip_logic', `${key === 'all'}`)
    navigate(`?${params.toString()}`, { replace: true })
  }

  const onReportDownloadClick = () => {
    if (isUrlToPdfFaasFeatureEnabled) {
      asyncDownload(parsedCampaignId, parsedId, { reportLang: lang })
      message.success(I18n.t('user_reports.messages.async_generation'))
    } else {
      download(parsedCampaignId, parsedId, {
        skipLogic,
        reportLang: lang,
      })
    }
  }

  const actions = () => {
    const menuItems = [
      {
        key: 'subject',
        label: I18n.t('common.text.subject'),
      },
      {
        key: 'all',
        label: I18n.t('common.text.all_pages'),
      },
    ]
    const actionList = [
      <Dropdown menu={{
        items: menuItems,
        onClick: onChangeView,
      }}
      >
        <Button>
          <Space>
            {I18n.t('common.text.view_as')}
            {skipLogic ? I18n.t('common.text.all_pages') : I18n.t('common.text.subject')}
            <DownOutlined />
          </Space>
        </Button>
      </Dropdown>,
    ]

    if (userReport.requireApproval) {
      if ((userReport.approvalStatus === ApprovalStatuses.PendingQC
          || userReport.approvalStatus === ApprovalStatuses.ChangeRequested)
        && userReport.permissions.startQc) {
        actionList.unshift(
          <Button
            type="primary"
            onClick={() => startQC(userReport.campaignId, userReport.id)}
          >
            {I18n.t('admin.report_review_review')}
          </Button>,
        )
      }
      if (userReport.approvalStatus === ApprovalStatuses.QCInProgress && userReport.permissions.abortQc) {
        actionList.unshift(
          <Button type="default" onClick={() => abortQC(userReport.campaignId, userReport.id)}>
            {I18n.t('admin.report_review_abort_qc')}
          </Button>,
        )
      }
      if (userReport.approvalStatus === ApprovalStatuses.QCInProgress && userReport.permissions.editQc) {
        actionList.unshift(
          <Button type="primary" onClick={() => sendToReview(userReport.campaignId, userReport.id)}>
            {(userReport.permissions.oneLevelQc || userReport.permissions.approversCanEdit)
              ? I18n.t('admin.report_review_approve_changes')
              : I18n.t('admin.report_review_send_for_approve')}
          </Button>,
        )
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
            {I18n.t('admin.report_review_approve')}
          </Button>,
          <Button type="default" onClick={() => requestChanges(userReport.campaignId, userReport.id)}>
            {(userReport.permissions.oneLevelQc || userReport.permissions.approversCanEdit)
              ? I18n.t('admin.report_review_edit')
              : I18n.t('admin.report_review_request_changes')}
          </Button>,
        ])
      }
      if (userReport.approvalStatus === ApprovalStatuses.Approved && userReport.permissions.manageApproval) {
        actionList.unshift(
          <Button type="primary" onClick={() => removeApproval(userReport.campaignId, userReport.id)}>
            {I18n.t('admin.report_review_remove_approval')}
          </Button>,
        )
      }
    }

    if (userReport.report.available_languages.length > 1) {
      actionList.push(
        <LangDropdownWithChangeUrl
          locales={userReport.report.available_languages.map(l => l.code)}
          currentLocale={lang}
          paramName="report_lang"
          key="lang"
        />,
      )
    }

    if (userReport.permissions.download) {
      actionList.push(
        <Button
          onClick={onReportDownloadClick}
          loading={downloadInProgress}
          disabled={downloadInProgress}
          key="download"
        >
          {I18n.t('shared.download')}
        </Button>,
      )
    }

    if (userReport.permissions.translate) {
      actionList.unshift(
        <Button type="primary" onClick={() => setShowTranslation(!showTranslation)}>
          <AIEditorIcon style={{ fill: '#fff' }} />
          {I18n.t('admin.translate_with_ai')}
        </Button>,
      )
    }

    return [
      <Tag color={TAG_COLORS[userReport.approvalStatus]}>
        {I18n.t(`admin.report_review_statuses_${userReport.approvalStatus}`)}
      </Tag>,
      ...actionList,
    ]
  }

  const normalizedReport = useMemo(() => normalize(userReport.report, schema), [userReport])
  const isThreesixty = useMemo(() => userReport.report.category === 'threesixty', [userReport])
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
            link: () => '/admin',
            label: () => I18n.t('admin.clients'),
          }, {
            link: state => `/admin/clients/${state.client.id}/projects`,
            label: state => state.client.name,
          }, {
            link: state => (`/admin/projects/${state.project.id}/new_campaigns`),
            label: state => state.project.name,
          }, {
            link: state => (`/admin/projects/${state.project.id}/new_campaigns/${state.campaign.id}`),
            label: state => state.campaign?.name,
          }, {
            link: state => (reportIsLoaded()
              // eslint-disable-next-line max-len
              ? `/admin/projects/${state.project.id}/new_campaigns/${state.campaign.id}/participants/subjects/${isThreesixty ? '' : userReport.user.id}`
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
            <Col flex={1} style={{ position: 'relative' }}>
              <Row justify="center">
                <Col>
                  <div className="reportContainer">
                    {renderReportPreview()}
                  </div>
                </Col>
              </Row>
              {userReport.permissions.translate && (
                <ReportTranslation
                  userReport={userReport}
                  availableLanguages={availableLanguages}
                  show={showTranslation}
                  onClose={() => setShowTranslation(false)}
                />
              )}
            </Col>
            {userReport.requireApproval
              && (
                <Col className={styles.sidebarWrapper}>
                  <Sidebar pages={pages} questions={normalizedReport.entities.questions} />
                </Col>
              )
            }
          </Row>
        </PageHeader>
      </Content>
    </Layout>
  )
}
