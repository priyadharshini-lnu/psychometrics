import React, { useEffect } from 'react'
import {
  Table, Menu, Row, Col, Input, Select, Pagination, Button, Modal, Switch, Tag, message, Tooltip,
} from 'antd'
import withEnhancedTable from 'modules/admin/hoc/withEnhancedTable'
import { TableConfig } from 'modules/admin/core/filterAndPagination/interfaces'
import {
  AppstoreOutlined, PlusOutlined, MoreOutlined, ExclamationCircleOutlined,
} from '@ant-design/icons'
import ConditionalDropdown from 'components/ConditionalDropdown'
import settings from 'modules/admin/settings'
import { State as UserState } from 'modules/admin/modules/campaigns/core/users'
import Modals from 'modules/admin/components/Modals/'

import User from 'modules/admin/modules/campaigns/interfaces/User'
import { Link } from 'react-router-dom'
import styles from './styles.scss'
import UserFormModal from './UserFormModal'
import ImportUsersModal from './ImportUsersModal'
import ToolsDropdown from './ToolsDropdown'

const MODALS = {
  UserFormModal,
  ImportUsersModal,
}

const { Column } = Table
const { Search } = Input
const { Option } = Select
const { I18n } = window

interface Props {
  fetch(campaignId: string, tableConfig: TableConfig): void
  remove(campaignId: string, id: number): void
  toggleActive(campaignId: string, id: number, options: { updateInListing: boolean }): void
  resetPassword(campaignId: string, id: number): void
  users: UserState
  match: {
    params: {
      projectId: string
      campaignId: string
    }
  }
  tableConfig: TableConfig
  changeFilter(filterName: string, filterValue: string): void
  removeFilter(filterName: string): void
  onTableChange(): void
  getSortOrder(column: string): 'descend' | 'ascend'
  changePage(page: number): void
  openModal(name: string, data?: { campaignId: string, user?: User }): void
  exportCompletionStatuses(campaignId: number): Promise<void>
}

const statusToColor = {
  not_started: 'gray',
  in_progress: 'orange',
  completed: 'green',
  interrupted: 'orange',
  timed_out: 'red',
}

const UserList: React.FC<Props> = ({
  fetch,
  users: {
    list,
    total,
    permissions,
  },
  match: { params: { projectId, campaignId } },
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
  toggleActive,
  resetPassword,
  exportCompletionStatuses,
}) => {
  useEffect(() => {
    fetch(campaignId, tableConfig)
  }, [tableConfig])

  const handleUserTypeFilterChange = (value: string): void => {
    if (value === 'All') { return removeFilter('isAnonymEq') }

    changeFilter('isAnonymEq', value)
  }

  return (
    <div>
      <Row justify="space-between" className="pm">
        <Col span={4} className="pls">
          <AppstoreOutlined style={{ fontSize: '16px' }} />
          <span className="mlm">{`${total} Users`}</span>
        </Col>
        <div>
          <ToolsDropdown
            campaignId={parseInt(campaignId, 10)}
            exportCompletionStatuses={exportCompletionStatuses}
            openModal={openModal}
            permissions={permissions}
          />
          <Select
            defaultValue="All"
            value={filters.isAnonymEq || 'All'}
            className={styles.userTypeFilter}
            onChange={handleUserTypeFilterChange}
          >
            <Option value="All" key="All">All</Option>
            <Option value="true" key="true">Anonymous</Option>
            <Option value="false" key="false">Identified</Option>
          </Select>
          <Search
            placeholder="Search"
            className={styles.searchInput}
            value={filters.filterableFields}
            onChange={e => changeFilter('filterableFields', e.target.value)}
          />
          {permissions.create && (
            <div className={styles.newUserButton}>
              <Button type="primary" onClick={() => openModal('UserFormModal', { campaignId })}>
                <PlusOutlined />
                <span>Add User</span>
              </Button>
            </div>
          )}
        </div>
      </Row>
      <Row>
        <Col span={24}>
          <Table className="mtm" rowKey="id" dataSource={list} onChange={onTableChange} pagination={false}>
            <Column
              title={I18n.t('administration.campaigns.users.id')}
              key="id"
              sorter
              sortOrder={getSortOrder('id')}
              render={({ id }) => (
                <Link to={`/administration/projects/${projectId}/new_campaigns/${campaignId}/users/${id}`}>
                  {id}
                </Link>
              )}
            />
            <Column
              title={I18n.t('administration.campaigns.users.is_active')}
              key="enable"
              render={
                ({
                  active, id,
                }) => (
                  <Switch
                    checked={active}
                    onChange={
                      () => {
                        toggleActive(campaignId, id, { updateInListing: true })
                      }
                  }
                  />
                )
              }
            />
            <Column
              title={I18n.t('administration.campaigns.users.name')}
              key="fullName"
              dataIndex="fullName"
            />
            <Column
              title={I18n.t('administration.campaigns.users.email')}
              key="email"
              sorter
              sortOrder={getSortOrder('email')}
              dataIndex="email"
            />
            <Column
              title={I18n.t('administration.dates.started')}
              key="startedAt"
              dataIndex="startedAt"
            />
            <Column
              title={I18n.t('administration.dates.completed')}
              key="completedAt"
              dataIndex="completedAt"
            />
            <Column
              title={I18n.t('administration.campaigns.users.created_by')}
              key="createdBy"
              dataIndex="createdBy"
            />
            <Column
              title={I18n.t('administration.campaigns.users.updated_by')}
              key="updated_by"
              sorter
              sortOrder={getSortOrder('email')}
              dataIndex="updated_by"
            />
            <Column
              title={I18n.t('administration.campaigns.users.completion_status')}
              key="completionStatus"
              sorter
              sortOrder={getSortOrder('completionStatus')}
              render={user => (
                <Tag
                  color={statusToColor[user.completionStatus]}
                >
                  {I18n.t(`frontend.campaign.users.completion_statuses.${user.completionStatus}`)}
                </Tag>
              )}
            />
            <Column
              title={I18n.t('common.column.status')}
              key="status"
              sorter
              sortOrder={getSortOrder('status')}
              render={user => (
                <Tag
                  color={statusToColor[user.status]}
                >
                  {I18n.t(`campaign_users.details.statuses.${user.status}`)}
                </Tag>
              )}
            />
            <Column
              title={I18n.t('administration.campaigns.actions')}
              key="action"
              render={user => (
                <ConditionalDropdown
                  menu={
                    ActionsMenu({
                      onEdit: () => openModal('UserFormModal', { campaignId, user }),
                      resetPassword: () => resetPassword(campaignId, user.id),
                      projectId,
                      campaignId,
                      userId: user.id,
                      email: user.email,
                      remove: () => remove(campaignId, user.id),
                      fullName: user.fullName,
                      permissions: user.permissions,
                    }) as React.ReactElement
                  }
                  innerElement={(
                    <Tooltip title={I18n.t('administration.table.more_actions')}>
                      <Button
                        id={`menu-button_campaign-subjects-${user.email}`}
                        type="link"
                        aria-label={I18n.t('administration.table.more_actions')}
                        aria-controls={`menu_campaign-subjects-${user.email}`}
                        aria-haspopup
                      >
                        <MoreOutlined />
                      </Button>
                    </Tooltip>
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

interface ActionMenuProps {
  onEdit(): void
  resetPassword(): void
  projectId: string
  campaignId: string
  userId: number
  email: string
  remove(): void
  fullName: string
  permissions: {
    edit: boolean
    loginAs: boolean
    resetPassword: boolean
    remove: boolean
  }
}

const ActionsMenu: React.FC<ActionMenuProps> = ({
  onEdit, resetPassword, remove, campaignId, projectId, userId, email, fullName, permissions,
}) => {
  const handleDelete = () => {
    Modal.confirm({
      title: I18n.t('common.text.confirm'),
      icon: <ExclamationCircleOutlined />,
      centered: true,
      width: 650,
      content: I18n.t('campaign_users.modals.remove', { email }),
      okText: I18n.t('common.text.ok'),
      cancelText: I18n.t('common.text.cancel'),
      onOk: () => {
        remove()
        message.success(I18n.t('campaign_users.details.modals.remove.successfully', { email }))
      },
    })
  }

  const resetPasswordAndShowMessage = () => {
    resetPassword()
    message.success(I18n.t('campaign_users.modals.change_password.successfully', { name: fullName }))
  }

  const handleChangePassword = () => {
    Modal.confirm({
      title: I18n.t('campaign_users.modals.change_password.title',
        {
          name: fullName,
        }),
      icon: <ExclamationCircleOutlined />,
      centered: true,
      width: 650,
      content: I18n.t('campaign_users.modals.change_password.content'),
      okText: I18n.t('yes'),
      cancelText: I18n.t('no'),
      onOk: resetPasswordAndShowMessage,
    })
  }

  return (
    <Menu
      id={`menu_campaign-subjects-${email}`}
      aria-labelledby={`menu-button_campaign-subjects-${email}`}
    >
      {permissions.edit && (
        <Menu.Item
          key="edit"
          onClick={onEdit}
        >
          {I18n.t('frontend.edit')}
        </Menu.Item>
      )}
      {permissions.loginAs && (
        <Menu.Item key="loginAs">
          <a
            href={`/administration/projects/${projectId}/new_campaigns/${campaignId}/users/${userId}/spoof`}
          >
            {I18n.t('frontend.login')}
          </a>
        </Menu.Item>
      )}
      {permissions.resetPassword && (
        <Menu.Item
          key="changePassword"
          onClick={handleChangePassword}
        >
          {I18n.t('frontend.change_password')}
        </Menu.Item>
      )}
      {permissions.remove && (
        <Menu.Item
          key="delete"
          onClick={handleDelete}
        >
          {I18n.t('common.actions.remove')}
        </Menu.Item>
      )}
    </Menu>
  )
}

export default withEnhancedTable<{}>(UserList, 'usersList', { maintainHistory: true })
