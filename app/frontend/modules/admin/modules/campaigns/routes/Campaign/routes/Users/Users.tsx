import React, { useEffect } from 'react'
import {
  Table, Menu, Row, Col, Input, Select, Pagination, Button, Dropdown, Modal, Switch,
} from 'antd'
import withEnhancedTable from 'modules/admin/hoc/withEnhancedTable'
import { TableConfig } from 'modules/admin/core/filterAndPagination/interfaces'
import {
  AppstoreOutlined, PlusOutlined, MoreOutlined, ExclamationCircleOutlined,
} from '@ant-design/icons'
import settings from 'modules/admin/settings'
import { State as UserState } from 'modules/admin/modules/campaigns/core/users'
import Modals from 'modules/admin/components/Modals/'

import User from 'modules/admin/modules/campaigns/interfaces/user'
import { Link } from 'react-router-dom'
import userPresenter from 'presenters/user'
import styles from './styles.scss'
import UserFormModal from './UserFormModal'
import ToolsDropdown from './ToolsDropdown'

const MODALS = {
  UserFormModal,
}

const { Column } = Table
const { Search } = Input
const { Option } = Select
const { I18n } = window

interface Props {
  fetch(campaignId: string, tableConfig: TableConfig): void
  remove(campaignId: string, id: number): void
  toggleStatus(campaignId: string, id: number): void
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
}

const UserList: React.FC<Props> = ({
  fetch,
  users: {
    list,
    total,
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
  toggleStatus,
  resetPassword,
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
          <ToolsDropdown projectId={parseInt(projectId, 10)} campaignId={parseInt(campaignId, 10)} />
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
          <div className={styles.newUserButton}>
            <Button type="primary" onClick={() => openModal('UserFormModal', { campaignId })}>
              <PlusOutlined />
              <span>Add User</span>
            </Button>
          </div>
        </div>
      </Row>
      <Row>
        <Col span={24}>
          <Table className="mtm" rowKey="id" dataSource={list} onChange={onTableChange} pagination={false}>
            <Column
              title="Id"
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
              title="Active"
              key="enable"
              render={
                ({
                  active, id,
                }) => (
                  <Switch
                    checked={active}
                    onChange={
                      () => {
                        toggleStatus(campaignId, id)
                      }
                  }
                  />
                )
              }
            />
            <Column
              title="First Name"
              key="firstName"
              sorter
              sortOrder={getSortOrder('firstName')}
              dataIndex="firstName"
            />
            <Column
              title="Last Name"
              key="lastName"
              sorter
              sortOrder={getSortOrder('lastName')}
              dataIndex="lastName"
            />
            <Column
              title="Email"
              key="email"
              sorter
              sortOrder={getSortOrder('email')}
              dataIndex="email"
            />
            <Column
              title="Created At"
              key="createdAt"
              sorter
              sortOrder={getSortOrder('createdAt')}
              dataIndex="createdAt"
            />
            <Column
              title="Created By"
              key="createdBy"
              dataIndex="createdBy"
            />
            <Column
              title="Updated At"
              key="updatedAt"
              dataIndex="updatedAt"
            />
            <Column
              title="Updated By"
              key="updated_by"
              sorter
              sortOrder={getSortOrder('email')}
              dataIndex="updated_by"
            />
            <Column
              title="Action"
              key="action"
              render={user => (
                <Dropdown
                  overlay={() => (
                    ActionsMenu({
                      onEdit: () => openModal('UserFormModal', { campaignId, user }),
                      resetPassword: () => resetPassword(campaignId, user.id),
                      projectId,
                      campaignId,
                      userId: user.id,
                      email: user.email,
                      remove: () => remove(campaignId, user.id),
                      firstName: user.firstName,
                      lastName: user.lastName,
                    }) as React.ReactElement
                  )}
                  trigger={['click']}
                >
                  <a>
                    <MoreOutlined />
                  </a>
                </Dropdown>
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
  firstName: string
  lastName: string
}

const ActionsMenu: React.FC<ActionMenuProps> = ({
  onEdit, resetPassword, remove, campaignId, projectId, userId, firstName, lastName, email,
}) => {
  const handleDelete = () => {
    Modal.confirm({
      title: I18n.t('common.text.confirm'),
      icon: <ExclamationCircleOutlined />,
      content: I18n.t('frontend.campaign.users.remove', { email }),
      okText: I18n.t('common.text.ok'),
      cancelText: I18n.t('common.text.cancel'),
      onOk: remove,
    })
  }

  const handleChangePassword = () => {
    Modal.confirm({
      title: I18n.t('frontend.campaign.users.change_password_confirmation_title',
        {
          full_name: userPresenter.getFullName({ firstName, lastName }),
        }),
      icon: <ExclamationCircleOutlined />,
      content: I18n.t('frontend.campaign.users.change_password_confirmation_content'),
      okText: I18n.t('yes'),
      cancelText: I18n.t('no'),
      onOk: resetPassword,
    })
  }

  return (
    <Menu>
      <Menu.Item key="edit">
        <div
          role="button"
          tabIndex={-1}
          onClick={onEdit}
        >
          {I18n.t('frontend.edit')}
        </div>
      </Menu.Item>
      <Menu.Item key="loginAs">
        <a
          href={`/administration/projects/${projectId}/new_campaigns/${campaignId}/users/${userId}/spoof`}
        >
          {I18n.t('frontend.login')}
        </a>
      </Menu.Item>
      <Menu.Item key="changePassword">
        <div
          role="button"
          tabIndex={-1}
          onClick={() => handleChangePassword()}
        >
          {I18n.t('frontend.change_password')}
        </div>
      </Menu.Item>
      <Menu.Item key="delete">
        <div
          role="button"
          tabIndex={-1}
          onClick={() => handleDelete()}
        >
          {I18n.t('common.actions.remove')}
        </div>
      </Menu.Item>
    </Menu>
  )
}

export default withEnhancedTable(UserList, 'usersList', { maintainHistory: true })
