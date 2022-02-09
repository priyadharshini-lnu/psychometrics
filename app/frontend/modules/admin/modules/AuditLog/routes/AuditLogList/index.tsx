
import React, { useEffect } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { get as getLogs, fetch, fetchActions } from 'modules/admin/modules/AuditLog/core'
import {
  Table, Row, Col, Pagination,
} from 'antd'
import { AppstoreOutlined } from '@ant-design/icons'
import { DEFAULT_PAGE_SIZE } from 'constants/campaign'
import { Link } from 'react-router-dom'
import { RootState } from 'modules/admin/core/rootReducers'
import withEnhancedTable from 'modules/admin/hoc/withEnhancedTable'
import { TableProps } from 'modules/admin/hoc/withEnhancedTable/interfaces'
import moment from 'moment'

const connecter = connect(
  (state: RootState) => ({
    auditLogs: getLogs(state),
  }),
  {
    fetch,
    fetchActions,
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>
type Props = TableProps & PropsFromRedux

const { Column } = Table
const { I18n } = window

const AuditLogList: React.FC<Props> = (
  {
    auditLogs: {
      list, total,
    },
    fetch,
    tableConfig: {
      page,
    },
    tableConfig,
    onTableChange,
    getSortOrder,
    changePage,
  },
) => {
  useEffect(() => {
    fetch(tableConfig)
  }, [tableConfig])

  return (
    <>
      <Row justify="space-between" className="pm">
        <Col span={4} className="pls">
          <AppstoreOutlined style={{ fontSize: '16px' }} />
          <span className="mlm">{`${total} Audit Logs`}</span>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <Table className="mtm" rowKey="id" dataSource={list} onChange={onTableChange} pagination={false}>
            <Column
              title={I18n.t('administration.audit_log.type')}
              dataIndex="recordType"
              key="recordType"
              sorter
              sortOrder={getSortOrder('recordType')}
            />
            <Column
              title={I18n.t('administration.audit_log.action')}
              key="action"
              sorter
              sortOrder={getSortOrder('name')}
              render={({ id, action }) => (
                <Link to={`/administration/audit_logs/${id}`}>{action}</Link>
              )}
            />
            <Column
              title={I18n.t('administration.audit_log.created_at')}
              dataIndex="createdAt"
              key="createdAt"
              sorter
              sortOrder={getSortOrder('createdAt')}
              render={createdAt => (
                moment(createdAt).format('lll')
              )}
            />
            <Column
              title={I18n.t('administration.audit_log.client')}
              key="client"
              sorter
              sortOrder={getSortOrder('client')}
              render={({ client, clientId }) => (
                client
                  ? <Link to={`/administration/clients/${client.id}/projects`}>{client.name}</Link>
                  : clientId && `${clientId} - deleted`
              )}
            />
            <Column
              title={I18n.t('administration.audit_log.project')}
              key="project"
              sorter
              sortOrder={getSortOrder('project')}
              render={({ project, projectId }) => (
                project
                  ? <Link to={`/administration/projects/${project.id}/new_campaigns`}>{project.name}</Link>
                  : projectId && `${projectId} - deleted`
              )}
            />
            <Column
              title={I18n.t('administration.audit_log.campaign')}
              key="campaign"
              sorter
              sortOrder={getSortOrder('campaign')}
              render={({ projectId, campaignId, campaign }) => (
                campaign ? (
                  <Link to={`/administration/projects/${projectId}/new_campaigns/${campaignId}`}>
                    {campaign.name}
                  </Link>
                ) : campaignId && `${campaignId} - deleted`
              )}
            />
          </Table>
        </Col>
      </Row>
      <div className="pl">
        <Pagination
          current={page}
          pageSize={DEFAULT_PAGE_SIZE}
          total={total}
          onChange={changePage}
          hideOnSinglePage
        />
      </div>
    </>
  )
}

export default withEnhancedTable(connecter(AuditLogList), 'auidtLogList', { maintainHistory: true })
