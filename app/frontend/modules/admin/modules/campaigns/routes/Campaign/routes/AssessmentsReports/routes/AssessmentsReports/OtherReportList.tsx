import React, { useEffect, useState } from 'react'
import {
  Button, Table, MenuProps, App,
} from 'antd'
import { useBreakpoint } from '@thetalententerprise/glint'
import { useParams } from 'react-router-dom'
import { connect, ConnectedProps } from 'react-redux'
import { MenuItem } from '~/interfaces/Antd'
import ConditionalDropdown from '~/components/ConditionalDropdown'
import { getTenantRowAttributes } from '~/utils/tableRowTenantAttributes'
import {
  fetchOtherReports,
  getOther,
  toggleAssessorAccess,
  exportData,
  toggleUserDashboard,
} from '~/modules/admin/modules/campaigns/core/reports'
import withEnhancedTable from '~/modules/admin/hoc/withEnhancedTable'
import { TableProps } from '~/modules/admin/hoc/withEnhancedTable/interfaces'
import { RootState } from '~/modules/admin/core/rootReducers'
import { openModal } from '~/modules/admin/core/ui/modals'
import { TableLayout } from '~/modules/admin/components/TableLayout'
import { DetailsDrawer, DrawerReport } from './ReportList/DetailsDrawer'

const { Column } = Table
const { I18n } = window

const PAGE_SIZE = 5

interface OwnProps {}

const connector = connect(
  (state: RootState) => ({
    reports: getOther(state),
  }),
  {
    fetchOtherReports,
    openModal,
    toggleAssessorAccess,
    toggleUserDashboard,
    exportData,
  },
)

type PropsFromRedux = ConnectedProps<typeof connector>

type Props = OwnProps & PropsFromRedux & TableProps

const OtherReportListComponent: React.FC<Props> = ({
  tableConfig,
  reports: {
    list,
    total,
  },
  fetchOtherReports,
  changePage,
  exportData,
  onTableChange,
}) => {
  const [drawerReport, setDrawerReport] = useState<DrawerReport | undefined>()
  useEffect(() => {
    fetchOtherReports(campaignId, tableConfig)
  }, [tableConfig.page])
  const { campaignId } = useParams() as { campaignId: string }
  const parsedPage = parseInt(tableConfig.page as unknown as string, 10)
  const screens = useBreakpoint()
  const { message } = App.useApp()

  const parsedCampaignId = parseInt(campaignId, 10)

  const handleExportData = (campaignId: number, reportId: number) => {
    exportData(campaignId, reportId).then(() => {
      message.success(I18n.t('campaign_report.messages.export_report_data_scheduled'))
    })
  }

  if (total === 0) { return null }

  return (
    <>
      <TableLayout
        embedded
        title={I18n.t('admin.other_reports')}
        pagination={{
          page: parsedPage,
          pageSize: tableConfig.pageSize ?? PAGE_SIZE,
          total,
          onChange: changePage,
          hideOnSinglePage: true,
        }}
        table={(
          <Table
            rowKey="id"
            dataSource={list}
            pagination={false}
            scroll={{ x: 'max-content' }}
            sticky
            onChange={onTableChange}
            onRow={getTenantRowAttributes}
          >
            <Column
              title={I18n.t('common.column.id')}
              dataIndex="id"
              key="id"
              fixed={screens.md ? 'left' : undefined}
            />
            <Column
              title={I18n.t('campaign_report.column.report_name')}
              key="name"
              dataIndex="name"
              width={300}
              fixed={screens.md ? 'left' : undefined}
              render={(text, report) => (
                <Button
                  type="link"
                  size="small"
                  className="p-0"
                  onClick={() => setDrawerReport(report as DrawerReport)}
                >
                  {text}
                </Button>
              )}
            />

            <Column
              title={I18n.t('common.column.action')}
              key="action"
              fixed={screens.md ? 'right' : undefined}
              render={report => (
                <ConditionalDropdown
                  menu={
                    getActionsMenuProps({
                      campaignId: parsedCampaignId,
                      id: report.id,
                      permissions: report.permissions,
                      exportData: handleExportData,
                    })
                }
                />
              )}
            />
          </Table>
        )}
      />
      {!!drawerReport && (
        <DetailsDrawer
          close={() => setDrawerReport(undefined)}
          report={drawerReport}
          isOtherReport
        />
      )}
    </>
  )
}

interface ActionMenuData {
  campaignId: number
  id: number
  permissions: {
    export: boolean
    remove: boolean
  }
  exportData(campaignId: number, id: number): void
}

const getActionsMenuProps = ({
  campaignId, id, permissions, exportData,
}: ActionMenuData):MenuProps => {
  const menuItems: MenuItem[] = []
  permissions.export && menuItems.push({
    key: 'export',
    label: I18n.t('campaign_report.actions.export_data'),
  })

  const handleMenuClick = ({ key }) => {
    if (key === 'export') {
      exportData(campaignId, id)
    }
  }

  return ({ items: menuItems, onClick: handleMenuClick })
}


export const OtherReportList = withEnhancedTable<OwnProps>(
  connector(OtherReportListComponent),
  'otherReports',
  {
    maintainHistory: false,
    pageSize: PAGE_SIZE,
  },
)
