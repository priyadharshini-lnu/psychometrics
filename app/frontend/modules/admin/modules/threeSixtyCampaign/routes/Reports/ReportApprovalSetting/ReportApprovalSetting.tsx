import React, { useEffect } from 'react'
import {
  Table, Space, Button, MenuProps,
} from 'antd'
import { connect, ConnectedProps } from 'react-redux'
import { PlusOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { useResources } from '~/hooks/useResources'
import { getErrorMsgFromJsonApiRequests } from '~/hooks/useResources/utils'
import {
  ReportApprovalSettings,
  ReportApprovalSettingsTR,
} from '~/modules/admin/modules/campaigns/core/reportApprovalSettings'
import Modals from '~/modules/admin/components/Modals'
import { openModal } from '~/modules/admin/core/ui/modals'
import { BaseMeta, RemoveResource, UpdateResource } from '~/hooks/useResources/interfaces'
import ConditionalDropdown from '~/components/ConditionalDropdown'
import { TableLayout } from '~/modules/admin/components/TableLayout'
import { RootState } from '~/modules/admin/core/rootReducers'
import { get as getCurrentUser, isSuperAdmin } from '~/core/currentUser'
import { RemoveReportApprovalSettingModal } from './RemoveReportApprovalModal'
import { ReportApprovalFormModal } from './ReportApprovalFormModal'
import { getCampaignId } from '~/modules/admin/modules/threeSixtyCampaign/core/campaignDetails'

const { Column } = Table
const { I18n } = window

const MODALS = {
  ReportApprovalFormModal,
  RemoveReportApprovalSettingModal,
}

const connecter = connect(
  (state: RootState) => ({
    currentUser: getCurrentUser(state),
    campaignId: getCampaignId(state),
  }),
  {
    openModal,
  },
)
type PropsFromRedux = ConnectedProps<typeof connecter>
type Props = PropsFromRedux

interface Meta extends BaseMeta {
  campaignId: number
  reportId: number
}

const ReportApprovalSettingComponent: React.FC<Props> = ({
  openModal,
  currentUser,
  campaignId,
}) => {
  const {
    data, meta, createResource, fetch, isLoading, updateResource, removeResource, requests,
  } = useResources<ReportApprovalSettings, Meta>(
    'report_approval_settings',
    {
      basePath: `campaigns/${campaignId}/`,
      responseType: ReportApprovalSettingsTR,
      apiConfig: {
        include: ['report'],
        fields: {
          reports: ['name'],
        },
      },
    },
  )
  useEffect(() => {
    fetch()
  }, [])

  const tableLoading = isLoading('fetch')

  const ApprovalSettingsTable = (
    <>
      <Table
        rowKey={row => row?.id ?? -1}
        dataSource={data}
        pagination={false}
        loading={tableLoading}
      >
        <Column
          title={I18n.t('common.column.report_id')}
          key="id"
          render={({ report }) => report.id}
        />
        <Column
          title={I18n.t('common.column.name')}
          key="report_name"
          render={({ report }) => (
            <>{report.name}</>
          )}
        />
        <Column
          key="qc_user_list"
          title={I18n.t('common.column.qc_user_list')}
          render={({ qcs }) => (
            <Space
              orientation="vertical"
            >
              {qcs.map(qc => <div key={`qcs_${qc.id}`}>{qc.email}</div>)}
            </Space>
          )}
        />
        <Column
          key="approvers_list"
          title={I18n.t('common.column.approvers_list')}
          render={({ approvers }) => (
            <Space orientation="vertical">
              {approvers.map(approver => (
                <div key={`approvers_${approver.id}`}>
                  {approver.email}
                </div>
              ))}
            </Space>
          )}
        />
        <Column
          key="approval_notification_list"
          title={I18n.t('common.column.approval_notification_list')}
          render={({ approvalNotificationUsers }) => (
            <Space orientation="vertical">
              {approvalNotificationUsers.map(
                user => <div key={`an_${user.id}`}>{user.email}</div>,
              )}
            </Space>
          )}
        />
        {isSuperAdmin(currentUser)
          && (
            <Column
              title={I18n.t('common.column.action')}
              key="action"
              render={reportApprovalSettings => (
                <ConditionalDropdown
                  menu={
                  getActionsMenuProps({
                    reportApprovalSettings,
                    updateResource,
                    removeResource,
                    openModal,
                    campaignId: meta.campaignId,
                    reportId: meta.reportId,
                  })
                }
                />
              )}
            />
          )}
      </Table>
    </>
  )

  const filter = (
    <Button
      type="primary"
      disabled={tableLoading || !!data[0]}
      onClick={() => {
        openModal(
          'ReportApprovalFormModal', {
            addReportApprovalSetting: createResource,
            campaignId: meta.campaignId,
            reportId: meta.reportId,
          },
        )
      }}
    >
      <PlusOutlined />
      {' '}
      {I18n.t('assessments_reports.report_approval.create_seetings')}

    </Button>
  )

  return (
    <>
      <TableLayout
        embedded
        table={ApprovalSettingsTable}
        filters={filter}
        title={I18n.t('assessments_reports.menu.report_approval')}
        recordCount={meta.recordCount}
        requestStatus={requests.fetch?.status}
        failureMsg={getErrorMsgFromJsonApiRequests(requests)}
      />
      <Modals modals={MODALS} />
    </>
  )
}
interface ActionMenuData {
  reportApprovalSettings: ReportApprovalSettings
  updateResource: UpdateResource<ReportApprovalSettings>
  removeResource: RemoveResource
  campaignId: number,
  reportId: number,
  openModal: (modalName: string, modalProps: unknown) => void
}

const getActionsMenuProps = ({
  reportApprovalSettings, updateResource, removeResource, openModal, campaignId, reportId,
}: ActionMenuData): MenuProps => {
  const { id } = reportApprovalSettings
  const menuItems = [
    { key: 'edit', label: I18n.t('common.actions.edit') },
    { key: 'remove', label: I18n.t('common.actions.remove') },
  ]
  const handleMenuClick = ({ key }) => {
    if (key === 'edit') {
      return openModal(
        'ReportApprovalFormModal', {
          reportApprovalSettings,
          updateReportApprovalSetting: updateResource,
          campaignId,
          reportId,
        },
      )
    }
    if (key === 'remove') {
      return openModal('RemoveReportApprovalSettingModal', {
        id, reportId, removeResource,
      })
    }
  }

  return ({ items: menuItems, onClick: handleMenuClick })
}

export const ReportApprovalSetting = connecter(ReportApprovalSettingComponent)
