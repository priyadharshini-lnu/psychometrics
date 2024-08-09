import React, { useEffect } from 'react'
import {
  Table, MenuProps, Row, Col, Input, Select, Pagination, Button, Switch, Tag, App, Tooltip,
} from 'antd'
import type { MessageInstance } from 'antd/es/message/interface'
import type { ModalStaticFunctions } from 'antd/es/modal/confirm'
import {
  AppstoreOutlined, PlusOutlined, MoreOutlined, ExclamationCircleOutlined,
} from '@ant-design/icons'
import { Link } from 'react-router-dom'
import { ItemType } from 'antd/lib/menu/hooks/useItems'
import { FilterValue } from 'antd/lib/table/interface'
import { ResetPasswordModal } from '~/modules/admin/modules/Users/routes/UserList/ResetPasswordModal'
import withEnhancedTable from '~/modules/admin/hoc/withEnhancedTable'
import { TableConfig } from '~/modules/admin/core/filterAndPagination/interfaces'
import ConditionalDropdown from '~/components/ConditionalDropdown'
import { State as UserState, DEFAULT_PAGE_SIZE } from '~/modules/admin/modules/campaigns/core/users'
import Modals from '~/modules/admin/components/Modals/'
import User from '~/modules/admin/modules/campaigns/interfaces/User'
import styles from './styles.less'
import UserFormModal from './UserFormModal'
import ImportUsersModal from './ImportUsersModal'
import ImportReportsAndAssessmentsModal from './ImportReportsAndAssessmentsModal'
import { ExportUsersModal } from './ExportUsersModal'
import ToolsDropdown from './ToolsDropdown'

const MODALS = {
  UserFormModal,
  ImportUsersModal,
  ResetPasswordModal,
  ExportUsersModal,
  ImportReportsAndAssessmentsModal,
}
export const FILTER_PREDICATES = {
  campaignUsersCompletionStatus: 'In',
  campaignUsersStatus: 'In',
}

const { Column } = Table
const { Search } = Input
const { Option } = Select
const { I18n } = window

interface Props {
  fetch(campaignId: string, tableConfig: TableConfig): void
  remove(campaignId: string, id: number): void
  toggleActive(campaignId: string, id: number, options: { updateInListing: boolean }): void
  users: UserState
  match: {
    params: {
      projectId: string
      campaignId: string
    }
  }
  tableConfig: TableConfig
  changeFilter(filterName: string, filterValue: string): void
  getFilteredValue(filterName: string): FilterValue
  removeFilter(filterName: string): void
  onTableChange(): void
  getSortOrder(column: string): 'descend' | 'ascend'
  changePage(page: number): void
  openModal(name: string, data?: object): void
  exportCompletionStatuses(campaignId: number): Promise<void>
  exportCompactCompletionStatuses(campaignId: number): Promise<void>
  exportReportsAndAssessments(campaignId: number): Promise<void>
  exportUsers(campaignId: number): Promise<void>
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
    pageSize,
  },
  tableConfig,
  getFilteredValue,
  changeFilter,
  removeFilter,
  onTableChange,
  getSortOrder,
  changePage,
  openModal,
  remove,
  toggleActive,
  exportCompletionStatuses,
  exportCompactCompletionStatuses,
  exportReportsAndAssessments,
  exportUsers,
}) => {
  const { modal, message } = App.useApp()
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
            exportCompactCompletionStatuses={exportCompactCompletionStatuses}
            exportReportsAndAssessments={exportReportsAndAssessments}
            exportUsers={exportUsers}
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
          <Table
            className="mtm"
            rowKey="id"
            dataSource={list}
            onChange={onTableChange}
            pagination={false}
            scroll={{ x: 1500 }}
          >
            <Column
              title={I18n.t('administration.campaigns.users.id')}
              key="id"
              sorter
              sortOrder={getSortOrder('id')}
              render={({ id }) => (
                <Link to={`/admin/projects/${projectId}/new_campaigns/${campaignId}/participants/users/${id}`}>
                  {id}
                </Link>
              )}
              width={80}
              fixed="left"
            />
            <Column
              title={I18n.t('administration.campaigns.users.is_active')}
              key="enable"
              render={
                ({
                  active, id,
                }) => (
                  <Tooltip title={
                    permissions.edit ? '' : I18n.t('administration.campaigns.users.no_permission_message')}
                  >
                    <Switch
                      disabled={!permissions.edit}
                      checked={active}
                      onChange={
                      () => {
                        toggleActive(campaignId, id, { updateInListing: true })
                      }
                  }
                    />
                  </Tooltip>
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
              key="campaignUsersStartedAt"
              dataIndex="startedAt"
              sorter
              sortOrder={getSortOrder('campaignUsersStartedAt')}
            />
            <Column
              title={I18n.t('administration.dates.completed')}
              key="campaignUsersCompletedAt"
              dataIndex="completedAt"
              sorter
              sortOrder={getSortOrder('campaignUsersCompletedAt')}
            />
            <Column
              title={I18n.t('administration.campaigns.users.created_by')}
              key="createdBy"
              dataIndex="createdBy"
            />
            <Column
              title={I18n.t('administration.campaigns.users.updated_by')}
              key="updatedBy"
              dataIndex="updatedBy"
            />
            <Column
              title={I18n.t('administration.campaigns.users.completion_status')}
              key="campaignUsersCompletionStatus"
              dataIndex="completionStatus"
              sorter
              sortOrder={getSortOrder('campaignUsersCompletionStatus')}
              filters={[
                { text: 'Not Started', value: '0' },
                { text: 'In Progress', value: '1' },
                { text: 'Completed', value: '2' },
              ]}
              filteredValue={getFilteredValue('campaignUsersCompletionStatus')}
              render={completionStatus => (
                <Tag
                  color={statusToColor[completionStatus]}
                >
                  {I18n.t(`frontend.campaign.users.completion_statuses.${completionStatus}`)}
                </Tag>
              )}
            />
            <Column
              title={I18n.t('common.column.status')}
              key="campaignUsersStatus"
              dataIndex="status"
              sorter
              sortOrder={getSortOrder('campaignUsersStatus')}
              filters={[
                { text: 'Not Started', value: '0' },
                { text: 'In Progress', value: '1' },
                { text: 'Interrupted', value: '2' },
                { text: 'Timed Out', value: '3' },
              ]}
              filteredValue={getFilteredValue('campaignUsersStatus')}
              render={status => (
                <Tag
                  color={statusToColor[status]}
                >
                  {I18n.t(`campaign_users.details.statuses.${status}`)}
                </Tag>
              )}
            />
            <Column
              title={I18n.t('administration.campaigns.actions')}
              key="action"
              render={(user: User) => (
                <ConditionalDropdown
                  menu={
                    getActionsMenuProps({
                      onEdit: () => openModal('UserFormModal', { campaignId, user }),
                      projectId,
                      campaignId,
                      user,
                      openModal,
                      remove: () => remove(campaignId, user.id),
                      permissions: user.permissions,
                      modal,
                      message,
                    })
                  }
                  innerElement={(
                    <Button
                      id={`menu-button_campaign-subjects-${user.email}`}
                      type="link"
                      aria-label={I18n.t('administration.table.more_actions')}
                      aria-controls={`menu_campaign-subjects-${user.email}`}
                      aria-haspopup
                    >
                      <Tooltip title={I18n.t('administration.table.more_actions')}><MoreOutlined /></Tooltip>
                    </Button>
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
          pageSize={pageSize || DEFAULT_PAGE_SIZE}
          total={total}
          onChange={changePage}
          hideOnSinglePage
        />
      </div>
      <Modals modals={MODALS} />
    </div>
  )
}

interface ActionMenuData {
  onEdit(): void
  projectId: string
  campaignId: string
  user: User
  remove(): void
  permissions: {
    edit: boolean
    loginAs: boolean
    resetPassword: boolean
    remove: boolean
  },
  openModal(name: string, props: object): void
  modal: Omit<ModalStaticFunctions, 'warn'>,
  message: MessageInstance
}

const getActionsMenuProps = ({
  onEdit, remove, campaignId, projectId, permissions, openModal, user, modal, message,
}: ActionMenuData):MenuProps => {
  const { email, id } = user

  const handleDelete = () => {
    modal.confirm({
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

  const menuItems:ItemType[] = []
  permissions.edit && menuItems.push({
    key: 'edit',
    label: I18n.t('frontend.edit'),
  })
  permissions.loginAs && menuItems.push({
    key: 'loginAs',
    label: (
      <a
        href={`/administration/projects/${projectId}/new_campaigns/${campaignId}/users/${id}/spoof`}
      >
        {I18n.t('frontend.login')}
      </a>
    ),
  })
  permissions.resetPassword && menuItems.push({
    key: 'changePassword',
    label: I18n.t('users.actions.reset_password.option'),
  })
  permissions.remove && menuItems.push({
    key: 'remove',
    label: I18n.t('common.actions.remove'),
  })

  const handleMenuClick = ({ key }) => {
    if (key === 'edit') {
      return onEdit()
    }
    if (key === 'changePassword') {
      return openModal(
        'ResetPasswordModal',
        {
          user,
          campaignId,
        },
      )
    }
    if (key === 'remove') {
      return handleDelete()
    }
  }

  return ({
    items: menuItems,
    onClick: handleMenuClick,
    id: `menu_campaign-subjects-${email}`,
    'aria-labelledby': `menu-button_campaign-subjects-${email}`,
  })
}

export default withEnhancedTable<{}>(UserList, 'usersList', {
  maintainHistory: true,
  filterPredicates: FILTER_PREDICATES,
})
