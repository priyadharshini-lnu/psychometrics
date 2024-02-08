import React from 'react'
import {
  Table, MenuProps, Row, Col, Switch, App,
} from 'antd'
import type { MessageInstance } from 'antd/es/message/interface'
import type { ModalStaticFunctions } from 'antd/es/modal/confirm'
import { ItemType } from 'antd/lib/menu/hooks/useItems'
import { MoreOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import { withRouter, RouteComponentProps, Link } from 'react-router-dom'
import ConditionalDropdown from '~/components/ConditionalDropdown'
import { PropsFromRedux } from './connect'
import { ParentResourceType } from '~/modules/admin/components/PushWebhookModal/constants'

const { Column } = Table
const { I18n } = window

interface OwnProps {
  match: {
    params: {
      projectId: string
      campaignId: string
    }
  }
  openModal(name: string, data?: {
    projectId: number
    campaignId: number
    parentId?: number
    parentType?: ParentResourceType
    testMode?: boolean
 }): void
}

export type Props = RouteComponentProps & OwnProps & PropsFromRedux

const ReportList: React.FC<Props> = ({
  reports: {
    list,
  },
  selectRecords,
  match: { params: { campaignId, projectId } },
  remove,
  openModal,
  toggleUserAccess,
}) => {
  const parsedCampaignId = parseInt(campaignId, 10)
  const parsedProjectId = parseInt(projectId, 10)
  const { modal, message } = App.useApp()

  return (
    <Row>
      <Col span={24}>
        <Table
          className="mtm"
          rowKey="id"
          dataSource={list}
          pagination={false}
          rowSelection={{ type: 'checkbox', onChange: (ids: number[]) => { selectRecords(ids) } }}
        >
          <Column
            title={I18n.t('common.column.id')}
            dataIndex="reportId"
            key="reportId"
          />
          <Column
            title={I18n.t('campaign_report.column.report_name')}
            key="name"
            dataIndex="name"
          />
          <Column
            title={I18n.t('campaign_report.column.report_bundle')}
            key="reportFamilyName"
            dataIndex="reportFamilyName"
          />
          <Column
            title={I18n.t('common.column.status')}
            key="status"
            render={({ status }) => I18n.t(`user_reports.statuses.${status}`)}
          />
          <Column
            title={I18n.t('campaign_report.column.user_access')}
            key="userAccess"
            render={({ userAccess, id, permissions }) => (
              <Switch
                checked={userAccess}
                disabled={!permissions.toggleAccess}
                onChange={() => {
                  toggleUserAccess(parsedCampaignId, id)
                }}
              />
            )}
          />
          <Column
            title={I18n.t('common.column.action')}
            key="action"
            render={userReport => (
              <ConditionalDropdown
                menu={
                  getActionsMenuProps({
                    projectId: parsedProjectId,
                    campaignId: parsedCampaignId,
                    userReportId: userReport.id,
                    userReportName: userReport.name,
                    remove: () => remove(parsedCampaignId, userReport.id),
                    internal: userReport.internal,
                    reportUrl: userReport.reportUrl,
                    permissions: userReport.permissions,
                    openModal,
                    modal,
                    message,
                  })
                }
                innerElement={(
                  <a>
                    <MoreOutlined />
                  </a>
                )}
              />
            )}
          />
        </Table>
      </Col>
    </Row>
  )
}

interface ActionMenuData {
  projectId: number
  campaignId: number
  userReportId: number
  userReportName: string
  internal: boolean
  reportUrl: string
  remove(): void
  permissions: {
    downloadReport: boolean
    remove: boolean
    viewReport: boolean
    pushWebhook: boolean
  }
  openModal(string, data?: {
    campaignId: number,
    parentId?: number,
    projectId?: number
    parentType?: ParentResourceType
    testMode?: boolean
  }): void
  modal: Omit<ModalStaticFunctions, 'warn'>
  message: MessageInstance
}

const getActionsMenuProps = ({
  campaignId, userReportId, projectId, userReportName, remove, internal, reportUrl,
  permissions, openModal, modal, message,
}:ActionMenuData):MenuProps => {
  const previewUrl = () => {
    if (internal) {
      return `/admin/projects/${projectId}/new_campaigns/${campaignId}/user_reports/${userReportId}`
    }

    return `/admin/projects/${projectId}/new_campaigns/${campaignId}/external_user_report/${userReportId}`
  }
  const handleDelete = () => {
    modal.confirm({
      title: I18n.t('common.text.confirm'),
      icon: <ExclamationCircleOutlined />,
      centered: true,
      width: 650,
      content: I18n.t('user_reports.modals.remove.content', { userReportName }),
      okText: I18n.t('common.text.ok'),
      cancelText: I18n.t('common.text.cancel'),
      onOk: () => {
        remove()
        message.success(I18n.t('user_reports.modals.remove.successfully', { userReportName }))
      },
    })
  }

  const menuItems: ItemType[] = []
  permissions.viewReport && (internal || reportUrl) && menuItems.push({
    key: 'viewReport',
    label: (
      <Link to={previewUrl()}>
        {I18n.t('reports.actions.view')}
      </Link>),
  })
  reportUrl && permissions.downloadReport && menuItems.push({
    key: 'downloadReport',
    label: <a href={reportUrl} target="_blank" rel="noopener noreferrer">{I18n.t('reports.actions.download')}</a>,
  })
  permissions.remove && menuItems.push({
    key: 'remove',
    label: I18n.t('common.actions.remove'),
  })
  permissions.pushWebhook && menuItems.push({
    label: 'Push Webhook',
    key: 'pushWebhook',
  })

  const handleMenuClick = ({ key }) => {
    if (key === 'remove') {
      handleDelete()
    }
    if (key === 'pushWebhook') {
      return openModal('PushWebhookModal', {
        campaignId,
        projectId,
        parentId: userReportId,
        parentType: ParentResourceType.UserReport,
        testMode: false,
      })
    }
  }

  return ({ items: menuItems, onClick: handleMenuClick })
}

export default withRouter(ReportList)
