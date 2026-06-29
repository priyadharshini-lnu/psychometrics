import React, { useEffect } from 'react'
import {
  Table, Row, Col, Input, Select, Pagination, Button, Space, MenuProps, App,
} from 'antd'
import { connect, ConnectedProps } from 'react-redux'
import { useParams } from 'react-router-dom'
import {
  AppstoreOutlined, PlusOutlined, MoreOutlined, ExclamationCircleOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
import { isRequestInProgress } from '~/core/request'
import { MenuItem } from '~/interfaces/Antd'
import withEnhancedTable from '~/modules/admin/hoc/withEnhancedTable'
import settings from '~/modules/admin/settings'
import Modals from '~/modules/admin/components/Modals/'
import User from '~/modules/admin/modules/campaigns/interfaces/User'
import {
  fetch,
  remove,
  get as getSmsInvites,
  FETCH,
  STATUSES,
  SmsInvite,
} from '~/modules/admin/modules/campaigns/core/smsInvites'
import { openModal } from '~/modules/admin/core/ui/modals'
import { RootState } from '~/modules/admin/core/rootReducers'
import { TableProps } from '~/modules/admin/hoc/withEnhancedTable/interfaces'
import ConditionalDropdown from '~/components/ConditionalDropdown'
import { ImportModal as ImportSmsInvites } from './ImportModal'
import { ToolsDropdown } from './ToolsDropdown'
import styles from './styles.less'
import { SendSmsModal } from './SendSmsModal'
import { FormModal as SmsInviteFormModal } from './FormModal'

const connecter = connect(
  (state: RootState) => ({
    smsInvites: getSmsInvites(state),
    isLoadingSMSInvites: isRequestInProgress(state, FETCH),
  }),
  {
    fetch,
    openModal,
    remove,
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
  SmsInviteFormModal,
}

const { Column } = Table
const { Search } = Input
const { Option } = Select
const { I18n } = window

const SmsInvitesComponent: React.FC<Props> = ({
  fetch,
  isLoadingSMSInvites,
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
  remove,
}) => {
  const { campaignId } = useParams() as { campaignId: string }
  const parsedCampaignId = parseInt(campaignId, 10)
  const { modal, message } = App.useApp()

  useEffect(() => {
    fetch(campaignId, tableConfig)
  }, [tableConfig])

  const handleUserTypeFilterChange = (value: string): void => {
    if (value === 'all') { return removeFilter('statusEq') }

    changeFilter('statusEq', value)
  }

  const handleDelete = (smsInvite: SmsInvite) => {
    modal.confirm({
      title: I18n.t('shared.confirm'),
      icon: <ExclamationCircleOutlined />,
      centered: true,
      width: 650,
      content: I18n.t('admin.sms_invites_messages_delete_confirm_text', { mobile_no: smsInvite.mobileNo }),
      okText: I18n.t('shared.ok'),
      cancelText: I18n.t('shared.cancel'),
      onOk: () => {
        remove(campaignId, smsInvite.id).then(() => {
          message.success(I18n.t('admin.sms_invites_messages_delete_success'))
        })
      },
    })
  }

  return (
    <div>
      <Row justify="space-between" className="pm">
        <Col span={4} className="pls">
          <AppstoreOutlined style={{ fontSize: '16px' }} />
          <span className="mlm">{`${total} ${I18n.t('admin.sms_contact')}`}</span>
        </Col>
        <Space>
          <Select
            defaultValue={I18n.t('admin.sms_invites_statuses_all')}
            value={filters.statusEq || I18n.t('admin.sms_invites_statuses_all')}
            className={styles.statusFilter}
            onChange={handleUserTypeFilterChange}
          >
            <Option value="all" key="all">
              {I18n.t('admin.sms_invites_statuses_all')}
            </Option>
            {STATUSES.map(status => (
              <Option value={status} key={status}>
                {I18n.t(`admin.sms_invites_statuses_${status}`)}
              </Option>
            ))}
          </Select>
          <Search
            placeholder={I18n.t('shared.search')}
            className={styles.searchInput}
            value={filters.filterableFields}
            onChange={e => changeFilter('filterableFields', e.target.value)}
          />
          <ToolsDropdown campaignId={parsedCampaignId} openModal={openModal} permissions={permissions} />

          {permissions.create && (
            <Button type="primary" onClick={() => openModal('SmsInviteFormModal', { campaignId })}>
              <PlusOutlined />
              <span>{I18n.t('admin.sms_invites_actions_add')}</span>
            </Button>
          )}
        </Space>
      </Row>
      <Row>
        <Col span={24}>
          <Table
            className="mtm"
            rowKey="id"
            loading={isLoadingSMSInvites}
            dataSource={list}
            onChange={onTableChange}
            pagination={false}
          >
            <Column
              title={I18n.t('shared.id')}
              key="id"
              sorter
              sortOrder={getSortOrder('id')}
              dataIndex="id"
            />
            <Column
              title={I18n.t('shared.first_name')}
              key="firstName"
              dataIndex="firstName"
              sorter
              sortOrder={getSortOrder('firstName')}
            />
            <Column
              title={I18n.t('shared.last_name')}
              key="lastName"
              dataIndex="lastName"
              sorter
              sortOrder={getSortOrder('lastName')}
            />
            <Column
              title={I18n.t('admin.sms_invites_columns_mobile_no')}
              key="mobileNo"
              dataIndex="mobileNo"
            />
            <Column
              title={I18n.t('shared.email')}
              key="email"
              dataIndex="email"
            />
            <Column
              title={I18n.t('shared.status')}
              key="status"
              render={({ status }) => I18n.t(`admin.sms_invites_statuses_${status}`)}
            />
            <Column
              title={I18n.t('admin.sms_invites_columns_created_at')}
              key="createdAt"
              dataIndex="createdAt"
              sorter
              sortOrder={getSortOrder('createdAt')}
            />
            <Column
              title={I18n.t('admin.sms_invites_columns_created_by')}
              key="createdBy"
              dataIndex="createdBy"
            />
            <Column
              title={I18n.t('shared.action')}
              key="action"
              render={smsInvite => (
                <ConditionalDropdown
                  menu={
                    getActionsMenuProps({
                      onEdit: () => openModal('SmsInviteFormModal', { campaignId, smsInvite }),
                      permissions,
                      onRemove: () => handleDelete(smsInvite),
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


const getActionsMenuProps = ({ onEdit, onRemove, permissions }): MenuProps => {
  const menuItems:MenuItem[] = []
  permissions.update && menuItems.push({
    key: 'edit',
    label: I18n.t('shared.edit'),
  })
  permissions.destroy && menuItems.push({
    key: 'remove',
    label: I18n.t('shared.remove'),
  })

  const handleMenuClick = ({ key }) => {
    if (key === 'edit') {
      return onEdit()
    }
    if (key === 'remove') {
      return onRemove()
    }
  }

  return ({ items: menuItems, onClick: handleMenuClick })
}
export const SmsInvitesTable = connecter(
  withEnhancedTable<{}>(SmsInvitesComponent, 'smsInvites', { maintainHistory: true }),
)
