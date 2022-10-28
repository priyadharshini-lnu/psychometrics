import React, { useEffect } from 'react'
import {
  Table, Menu, Row, Col, message, Pagination,
} from 'antd'
import { useParams } from 'react-router-dom'
import { MoreOutlined } from '@ant-design/icons'
import ConditionalDropdown from 'components/ConditionalDropdown'
import { connect, ConnectedProps } from 'react-redux'
import {
  fetchOtherReports,
  getOther,
  toggleAssessorAccess,
  exportData,
  toggleUserDashboard,
} from 'modules/admin/modules/campaigns/core/reports'
import withEnhancedTable from 'modules/admin/hoc/withEnhancedTable'
import { TableProps } from 'modules/admin/hoc/withEnhancedTable/interfaces'
import { RootState } from 'modules/admin/core/rootReducers'
import { openModal } from 'modules/admin/core/ui/modals'

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
  useEffect(() => {
    fetchOtherReports(campaignId, tableConfig)
  }, [tableConfig.page])
  const { campaignId } = useParams<{ campaignId: string }>()
  const parsedPage = parseInt(tableConfig.page as unknown as string, 10)

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
            />

            <Column
              title={I18n.t('common.column.action')}
              key="action"
              render={report => (
                <ConditionalDropdown
                  menu={
                  ActionsMenu({
                    campaignId: parsedCampaignId,
                    id: report.id,
                    permissions: report.permissions,
                    exportData: handleExportData,
                  }) as React.ReactElement
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
    </>
  )
}

interface ActionMenuProps {
  campaignId: number
  id: number
  permissions: {
    export: boolean
    remove: boolean
  }
  exportData(campaignId: number, id: number): void
}

const ActionsMenu: React.FC<ActionMenuProps> = ({
  campaignId, id, permissions, exportData,
}) => (
  <Menu>
    {permissions.export && (
      <Menu.Item key="export">
        <div
          role="button"
          tabIndex={-1}
        >
          <div
            role="button"
            tabIndex={-1}
            onClick={() => exportData(campaignId, id)}
          >
            {I18n.t('campaign_report.actions.export_data')}
          </div>
        </div>
      </Menu.Item>
    )}
  </Menu>
)


export const OtherReportList = withEnhancedTable<OwnProps>(
  connector(OtherReportListComponent),
  'otherReports',
  {
    maintainHistory: false,
    pageSize: 5,
  },
)
