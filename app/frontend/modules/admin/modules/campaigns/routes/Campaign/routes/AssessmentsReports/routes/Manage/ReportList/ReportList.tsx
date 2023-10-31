import React from 'react'
import {
  Table, MenuProps, Row, Col, Switch, message,
} from 'antd'
import { MoreOutlined } from '@ant-design/icons'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import { ItemType } from 'antd/lib/menu/hooks/useItems'
import ConditionalDropdown from '~/components/ConditionalDropdown'
import { PropsFromRedux } from './connect'

const { Column } = Table
const { I18n } = window

interface OwnProps {
  match: {
    params: {
      projectId: string
      campaignId: string
    }
  }
  openModal(name: string, data?: { campaignId: number, campaignReportId: number }): void
}

type Props = RouteComponentProps & OwnProps & PropsFromRedux

const ReportList: React.FC<Props> = ({
  reports: {
    list,
    reportPermissions,
  },
  match: { params: { campaignId } },
  openModal,
  selectRecords,
  toggleAssessorAccess,
  exportData,
  toggleUserDashboard,
}) => {
  const parsedCampaignId = parseInt(campaignId, 10)

  const handleExportData = (campaignId: number, reportId: number) => {
    exportData(campaignId, reportId).then(() => {
      message.success(I18n.t('campaign_report.messages.export_report_data_scheduled'))
    })
  }

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
            title={I18n.t('campaign_report.column.user_access')}
            key="userAccess"
            render={({ userAccess, id }) => (
              <Switch
                checked={userAccess}
                disabled={!reportPermissions.toggleUserAccess}
                onChange={() => openModal('ToggleUserAccessModal',
                  { campaignId, campaignReportId: id, userAccess })}
              />
            )}
          />
          <Column
            title={I18n.t('campaign_report.column.assessor_access')}
            key="userAccess"
            render={({ assessorAccess, id }) => (
              <Switch
                checked={assessorAccess}
                disabled={!reportPermissions.toggleAssessorAccess}
                onChange={() => toggleAssessorAccess(parsedCampaignId, id)}
              />
            )}
          />
          <Column
            title={I18n.t('campaign_report.column.user_dashboard')}
            key="userDashboard"
            render={({ userDashboard, id }) => (
              <Switch
                checked={userDashboard}
                disabled={!reportPermissions.toggleUserDashboard}
                onChange={() => toggleUserDashboard(parsedCampaignId, id)}
              />
            )}
          />
          <Column
            title={I18n.t('common.column.action')}
            key="action"
            render={report => (
              <ConditionalDropdown
                menu={
                  getActionsMenuProps({
                    campaignId: parsedCampaignId,
                    campaignReportId: report.id,
                    reportId: report.reportId,
                    reportName: report.name,
                    permissions: report.permissions,
                    openModal,
                    exportData: handleExportData,
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
  campaignId: number
  reportId: number
  campaignReportId: number
  reportName: string
  openModal(name: string, data?: { campaignId: number, campaignReportId: number, reportName: string }): void
  permissions: {
    export: boolean
    remove: boolean
  }
  exportData(campaignId: number, reportId: number): void
}

const getActionsMenuProps = ({
  campaignId, reportId, campaignReportId, reportName, openModal, permissions, exportData,
}: ActionMenuData): MenuProps => {
  const menuItems: ItemType[] = []
  permissions.export && menuItems.push({
    key: 'export',
    label: I18n.t('campaign_report.actions.export_data'),
  })
  permissions.remove && menuItems.push({
    key: 'remove',
    label: I18n.t('common.actions.remove'),
  })

  const handleMenuClick = ({ key }) => {
    if (key === 'export') {
      exportData(campaignId, reportId)
    }
    if (key === 'remove') {
      openModal('RemoveReportModal', { campaignId, campaignReportId, reportName })
    }
  }

  return ({ items: menuItems, onClick: handleMenuClick })
}

export default withRouter(ReportList)
