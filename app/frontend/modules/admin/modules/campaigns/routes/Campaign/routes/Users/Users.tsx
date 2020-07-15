import React, { useEffect } from 'react'
import {
  Table, Menu, Row, Col, Input, Select, Pagination, Button, Dropdown,
} from 'antd'
import withEnhancedTable from 'modules/admin/hoc/withEnhancedTable'
import { TableConfig } from 'modules/admin/core/filterAndPagination/interfaces'
import { AppstoreOutlined, PlusOutlined, MoreOutlined } from '@ant-design/icons'
import settings from 'modules/admin/settings'
import { State as UserState } from 'modules/admin/modules/campaigns/core/users'
import Modals from 'modules/admin/components/Modals/'
import User from 'modules/admin/modules/campaigns/interfaces/user'
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
  fetch(projectId: string, campaignId: string, tableConfig: TableConfig): void
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
  openModal(name: string, data?: { projectId: string, campaignId: string, user?: User }): void
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
}) => {
  useEffect(() => {
    fetch(projectId, campaignId, tableConfig)
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
            <Button type="primary" onClick={() => openModal('UserFormModal', { projectId, campaignId })}>
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
              dataIndex="id"
              key="id"
              sorter
              sortOrder={getSortOrder('id')}
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
                      onEdit: () => openModal('UserFormModal', { projectId, campaignId, user }),
                      projectId,
                      campaignId,
                      userId: user.id,
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
  projectId: string
  campaignId: string
  userId: string
}

const ActionsMenu: React.FC<ActionMenuProps> = ({
  onEdit, projectId, campaignId, userId,
}) => (
  <Menu>
    <Menu.Item key="edit">
      <div
        role="button"
        tabIndex={-1}
        onClick={onEdit}
      >
        Edit
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
      {I18n.t('frontend.change_password')}
    </Menu.Item>
    <Menu.Item key="delete">
      {I18n.t('frontend.delete')}
    </Menu.Item>
  </Menu>
)

export default withEnhancedTable(UserList, 'usersList', { maintainHistory: true })
