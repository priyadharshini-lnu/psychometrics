import React, { useEffect } from 'react'
import {
  Table, Row, Col, Input, Select, Pagination,
} from 'antd'
import { connect, ConnectedProps } from 'react-redux'
import withEnhancedTable from 'modules/admin/hoc/withEnhancedTable'
import { AppstoreOutlined } from '@ant-design/icons'
import settings from 'modules/admin/settings'
import Modals from 'modules/admin/components/Modals/'
import User from 'modules/admin/modules/campaigns/interfaces/User'
import { useParams } from 'react-router-dom'
import {
  fetch,
  get as getSmsInvites,
  STATUSES,
} from 'modules/admin/modules/campaigns/core/smsInvites'
import { openModal } from 'modules/admin/core/ui/modals'
import { RootState } from 'modules/admin/core/rootReducers'
import { TableProps } from 'modules/admin/hoc/withEnhancedTable/interfaces'
import { ImportModal as ImportSmsInvites } from './ImportModal'
import { ToolsDropdown } from './ToolsDropdown'
import styles from './styles.scss'
import { SendSmsModal } from './SendSmsModal'

const connecter = connect(
  (state: RootState) => ({
    smsInvites: getSmsInvites(state),
  }),
  {
    fetch,
    openModal,
  },
)

type PropsFromRedux = ConnectedProps<typeof connecter>

interface OwnProps {
  openModal(name: string, data?: { campaignId: string, user?: User }): void
}

type Props = OwnProps & TableProps & PropsFromRedux

const MODALS = {
  ImportSmsInvites,
  SendSmsModal,
}

const { Column } = Table
const { Search } = Input
const { Option } = Select
const { I18n } = window

const SmsInvitesComponent: React.FC<Props> = ({
  fetch,
  smsInvites: {
    list,
    total,
    permissions,
  },
  tableConfig: {
    filters,
    page,
  },
  tableConfig,
  changeFilter,
  removeFilter,
  onTableChange,
  getSortOrder,
  changePage,
  openModal,
}) => {
  const { campaignId } = useParams<{ campaignId: string }>()
  const parsedCampaignId = parseInt(campaignId, 10)

  useEffect(() => {
    fetch(campaignId, tableConfig)
  }, [tableConfig])

  const handleUserTypeFilterChange = (value: string): void => {
    if (value === 'all') { return removeFilter('statusEq') }

    changeFilter('statusEq', value)
  }

  return (
    <div>
      <Row justify="space-between" className="pm">
        <Col span={4} className="pls">
          <AppstoreOutlined style={{ fontSize: '16px' }} />
          <span className="mlm">{`${total} ${I18n.t('common.model.sms_invite')}`}</span>
        </Col>
        <div>
          <Select
            defaultValue="All"
            value={filters.statusEq || 'All'}
            className={styles.statusFilter}
            onChange={handleUserTypeFilterChange}
          >
            <Option value="all" key="all">
              {I18n.t('administration.sms_invites.statuses.all')}
            </Option>
            {STATUSES.map(status => (
              <Option value={status} key={status}>
                {I18n.t(`administration.sms_invites.statuses.${status}`)}
              </Option>
            ))}
          </Select>
          <Search
            placeholder="Search"
            className={styles.searchInput}
            value={filters.filterableFields}
            onChange={e => changeFilter('filterableFields', e.target.value)}
          />
          <ToolsDropdown campaignId={parsedCampaignId} openModal={openModal} permissions={permissions} />
        </div>
      </Row>
      <Row>
        <Col span={24}>
          <Table className="mtm" rowKey="id" dataSource={list} onChange={onTableChange} pagination={false}>
            <Column
              title={I18n.t('common.column.id')}
              key="id"
              sorter
              sortOrder={getSortOrder('id')}
              dataIndex="id"
            />
            <Column
              title={I18n.t('administration.sms_invites.columns.first_name')}
              key="firstName"
              dataIndex="firstName"
              sorter
              sortOrder={getSortOrder('firstName')}
            />
            <Column
              title={I18n.t('administration.sms_invites.columns.last_name')}
              key="lastName"
              dataIndex="lastName"
              sorter
              sortOrder={getSortOrder('lastName')}
            />
            <Column
              title={I18n.t('administration.sms_invites.columns.mobile_no')}
              key="mobileNo"
              dataIndex="mobileNo"
            />
            <Column
              title={I18n.t('administration.sms_invites.columns.email')}
              key="email"
              dataIndex="email"
            />
            <Column
              title={I18n.t('common.column.status')}
              key="status"
              render={({ status }) => I18n.t(`administration.sms_invites.statuses.${status}`)}
            />
            <Column
              title={I18n.t('administration.sms_invites.columns.created_at')}
              key="createdAt"
              dataIndex="createdAt"
              sorter
              sortOrder={getSortOrder('createdAt')}
            />
            <Column
              title={I18n.t('administration.sms_invites.columns.created_by')}
              key="createdBy"
              dataIndex="createdBy"
            />
          </Table>
        </Col>
      </Row>
      <div className="pl">
        <Pagination
          current={page}
          pageSize={settings.pagination.defaultPageSize}
          total={total}
          onChange={changePage}
          hideOnSinglePage
        />
      </div>
      <Modals modals={MODALS} />
    </div>
  )
}

export const SmsInvites = connecter(
  withEnhancedTable<{}>(SmsInvitesComponent, 'smsInvites', { maintainHistory: true }),
)
