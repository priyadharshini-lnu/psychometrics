import React, { useState } from 'react'
import {
  Table, MenuProps, Row, Col, Switch, App,
} from 'antd'
import { useParams } from 'react-router-dom'
import { camelizeKeys } from '~/utils/object'
import { getTenantRowAttributes } from '~/utils/tableRowTenantAttributes'
import { MoreOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { MenuItem } from '~/interfaces/Antd'
import ConditionalDropdown from '~/components/ConditionalDropdown'
import { PropsFromRedux } from './connect'
import Locales from './locales'
import { DetailsDrawer, DrawerReport } from './DetailsDrawer'

const { Column } = Table
const { I18n } = window

interface OwnProps {
  openModal(name: string, data?: { campaignId: number, campaignReportId: number }): void
}

type Props = OwnProps & PropsFromRedux

const ReportList: React.FC<Props> = ({
  reports: {
    list,
    reportPermissions,
  },
  isReportsLoading,
  openModal,
  selectRecords,
  toggleAssessorAccess,
  exportData,
  toggleAutoAssign,
  toggleUserDashboard,
  toggleMainReport,
  features,
}) => {
  const [drawerReport, setDrawerReport] = useState<DrawerReport>()
  const { campaignId } = useParams() as { campaignId: string }
  const parsedCampaignId = parseInt(campaignId, 10)
  const { message } = App.useApp()
  const { uploadBulkAssetsEnabled } = camelizeKeys(features)

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
          loading={isReportsLoading}
          pagination={false}
          rowSelection={{ type: 'checkbox', onChange: (ids: number[]) => { selectRecords(ids) } }}
          scroll={{ x: 'max-content' }}
          onRow={getTenantRowAttributes}
        >
          <Column
            title={I18n.t('common.column.id')}
            dataIndex="reportId"
            key="reportId"
            fixed="left"
            width={50}
          />
          <Column
            title={I18n.t('campaign_report.column.report_name')}
            key="name"
            dataIndex="name"
            render={(text, record) => (
              <a onClick={() => setDrawerReport(record as DrawerReport)}>
                {text}
              </a>
            )}
            fixed="left"
          />
          <Column
            title={I18n.t('campaign_report.column.report_bundle')}
            key="reportFamilyName"
            dataIndex="reportFamilyName"
          />
          <Column
            title={I18n.t('campaign_report.column.auto_assign')}
            key="autoAssign"
            render={({ autoAssign, id }) => (
              <Switch
                checked={autoAssign}
                disabled={!reportPermissions.toggleAutoAssign}
                onChange={() => toggleAutoAssign(parsedCampaignId, id)}
              />
            )}
          />
          <Column
            title={I18n.t('campaign_report.column.user_access')}
            key="userAccess"
            render={({ userAccess, id }) => (
              <Switch
                checked={userAccess}
                disabled={!reportPermissions.toggleUserAccess}
                onChange={() => openModal('ToggleUserAccessModal', {
                  campaignId,
                  campaignReportId: id,
                  userAccess,
                })}
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
            title={I18n.t('campaign_report.column.main_report')}
            key="userDashboard"
            render={({ mainReport, id }) => (
              <Switch
                checked={mainReport}
                disabled={!reportPermissions.toggleMainReport}
                onChange={() => toggleMainReport(parsedCampaignId, id, !mainReport)}
              />
            )}
          />
          <Column
            title={I18n.t('campaign_report.column.locales')}
            key="availableLocales"
            render={({
              id, availableLanguages, effectiveDefaultLanguage, reportLocales, internal,
            }) => (
              <Locales
                id={id}
                availableLanguages={availableLanguages}
                defaultLanguage={effectiveDefaultLanguage}
                reportLocales={reportLocales}
                campaignId={campaignId}
                internal={internal}
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
                    customUpload: report.customUpload,
                    openModal,
                    exportData: handleExportData,
                    uploadBulkAssetsEnabled,
                  })
                }
                innerElement={(
                  <a>
                    <MoreOutlined />
                  </a>
                )}
              />
            )}
            width={50}
            fixed="right"
          />
        </Table>
        {drawerReport ? (
          <DetailsDrawer
            close={() => setDrawerReport(undefined)}
            report={drawerReport}
          />
        ) : null}
      </Col>
    </Row>
  )
}

interface ActionMenuData {
  campaignId: number
  reportId: number
  campaignReportId: number
  reportName: string
  customUpload: boolean
  uploadBulkAssetsEnabled: boolean
  openModal(name: string, data?: { campaignId: number, campaignReportId: number, reportName: string }): void
  permissions: {
    export: boolean
    remove: boolean
  }
  exportData(campaignId: number, reportId: number): void
}

const getActionsMenuProps = ({
  campaignId, reportId, campaignReportId, reportName, openModal, permissions, exportData, customUpload,
  uploadBulkAssetsEnabled,
}: ActionMenuData): MenuProps => {
  const menuItems: MenuItem[] = []
  permissions.export && menuItems.push({
    key: 'export',
    label: I18n.t('campaign_report.actions.export_data'),
  })
  permissions.remove && menuItems.push({
    key: 'remove',
    label: I18n.t('common.actions.remove'),
  })
  customUpload && uploadBulkAssetsEnabled && menuItems.push({
    key: 'upload_bulk_assets',
    label: 'Upload Bulk Assets',
  })

  const handleMenuClick = ({ key }) => {
    if (key === 'export') {
      exportData(campaignId, reportId)
    }
    if (key === 'remove') {
      openModal('RemoveReportModal', { campaignId, campaignReportId, reportName })
    }
    if (key === 'upload_bulk_assets') {
      openModal('UploadBulkAssetsModal', {
        campaignReportId,
        campaignId,
        reportName: '',
      })
    }
  }

  return ({ items: menuItems, onClick: handleMenuClick })
}

export default ReportList
