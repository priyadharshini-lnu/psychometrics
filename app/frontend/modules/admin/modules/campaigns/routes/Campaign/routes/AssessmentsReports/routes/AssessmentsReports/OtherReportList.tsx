import React, { useEffect, useState } from 'react'
import {
  Table, MenuProps, Row, Col, App, Pagination,
} from 'antd'
import { useParams } from 'react-router-dom'
import { connect, ConnectedProps } from 'react-redux'
import { MoreOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
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
import { DetailsDrawer, DrawerReport } from './ReportList/DetailsDrawer'

const { Column } = Table
const { I18n } = window

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
  const { message } = App.useApp()

  const parsedCampaignId = parseInt(campaignId, 10)

  const handleExportData = (campaignId: number, reportId: number) => {
    exportData(campaignId, reportId).then(() => {
      message.success(I18n.t('campaign_report.messages.export_report_data_scheduled'))
    })
  }

  return (
    <>
      <Row>
        <Col span={24}>
          <Table
            className="mtm"
            rowKey="id"
            dataSource={list}
            pagination={false}
            onChange={onTableChange}
            onRow={getTenantRowAttributes}
          >
            <Column
              title={I18n.t('common.column.id')}
              dataIndex="id"
              key="id"
            />
            <Column
              title={I18n.t('campaign_report.column.report_name')}
              key="name"
              dataIndex="name"
              render={(text, report) => (
                <a onClick={() => setDrawerReport(report as DrawerReport)}>
                  {text}
                </a>
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
                      id: report.id,
                      permissions: report.permissions,
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
      <Row className="pt-4 pb-4 ps-4 pe-4">
        <Col>
          <Pagination
            hideOnSinglePage
            current={parsedPage}
            pageSize={tableConfig.pageSize}
            total={total}
            onChange={changePage}
          />
        </Col>
      </Row>
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
    pageSize: 5,
  },
)
