import React, { useEffect } from 'react'
import {
  Table, MenuProps, Row, Col, Input, Select, Pagination, Button, Switch, Tag, App, Tooltip, Flex,
} from 'antd'
import type { MessageInstance } from 'antd/es/message/interface'
import type { ModalStaticFunctions } from 'antd/es/modal/confirm'
import { Link, useParams } from 'react-router-dom'
import { FilterValue } from 'antd/es/table/interface'
import {
  AppstoreOutlined, PlusOutlined, MoreOutlined, ExclamationCircleOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
import { MenuItem } from '~/interfaces/Antd'
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
import { useWindowSize } from '~/hooks/useWindowSize'
import { ParentResourceType } from '~/modules/admin/components/PushWebhookModal/constants'
import PushWebhookModal from '~/modules/admin/components/PushWebhookModal/PushWebhookModal'
import { UserFilterModal } from './UserFilterModal'
import BulkDownloadIdpReports from './BulkDownloadIdpReports'

const MODALS = {
  UserFormModal,
  ImportUsersModal,
  ResetPasswordModal,
  ExportUsersModal,
  ImportReportsAndAssessmentsModal,
  PushWebhookModal,
  UserFilterModal,
  BulkDownloadIdpReports,
}
export const FILTER_PREDICATES = {
  campaignUsersCompletionStatus: 'In',
  campaignUsersStatus: 'In',
  campaignUsersActive: 'In',
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
  isLoadingUsers: boolean
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

const CompletionStatuses = [
  { text: I18n.t('frontend.campaign.users.completion_statuses.not_started'), value: '0' },
  { text: I18n.t('frontend.campaign.users.completion_statuses.in_progress'), value: '1' },
  { text: I18n.t('frontend.campaign.users.completion_statuses.completed'), value: '2' },
]

const UsersStatuses = [
  { text: I18n.t('campaign_users.details.statuses.not_started'), value: '0' },
  { text: I18n.t('campaign_users.details.statuses.in_progress'), value: '1' },
  { text: I18n.t('campaign_users.details.statuses.completed'), value: '2' },
  { text: I18n.t('campaign_users.details.statuses.interrupted'), value: '3' },
  { text: I18n.t('campaign_users.details.statuses.timed_out'), value: '4' },
]
const UserList: React.FC<Props> = ({
  fetch,
  users: {
    list,
    total,
    permissions,
  },
  isLoadingUsers,
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
  const { campaignId, projectId } = useParams() as { campaignId: string, projectId: string }
  const { modal, message } = App.useApp()
  const { width: windowWidth } = useWindowSize()

  useEffect(() => {
    fetch(campaignId, {
      ...tableConfig,
      filters: {
        ...tableConfig.filters,
        campaignUsersActiveIn: filters.campaignUsersActiveIn || 'true',
      },
    })
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
          <span className="mlm">{`${total} ${I18n.t('admin.campaigns_users_title')}`}</span>
        </Col>
        <Flex gap={8}>
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
            <Option value="All" key="All">{I18n.t('admin.campaigns_users_filters_all')}</Option>
            <Option value="true" key="true">{I18n.t('admin.campaigns_users_filters_anonymous')}</Option>
            <Option value="false" key="false">{I18n.t('admin.campaigns_users_filters_identified')}</Option>
          </Select>
          <Search
            placeholder={I18n.t('shared.search')}
            className={styles.searchInput}
            value={filters.filterableFields}
            onChange={e => changeFilter('filterableFields', e.target.value)}
          />
          {permissions.create && (
            <div className={styles.newUserButton}>
              <Button type="primary" onClick={() => openModal('UserFormModal', { campaignId })}>
                <PlusOutlined />
                <span>{I18n.t('admin.campaigns_users_add_user')}</span>
              </Button>
            </div>
          )}
        </Flex>
      </Row>
      <Row>
        <Col span={24}>
          <Table
            className="mtm"
            rowKey="id"
            dataSource={list}
            onChange={onTableChange}
            loading={isLoadingUsers}
            pagination={false}
            scroll={{ x: 'max-content' }}
            sticky={{ offsetHeader: 50 }}
          >
            <Column
              title={I18n.t('shared.id')}
              key="id"
              sorter
              fixed={windowWidth > 800 ? 'left' : undefined}
              sortOrder={getSortOrder('id')}
              render={({ id }) => (
                <Link to={`${id}`}>
                  {id}
                </Link>
              )}
              width={100}
            />
            <Column
              title={I18n.t('admin.campaigns_users_is_active')}
              key="campaignUsersActive"
              filters={[
                { text: 'Active', value: true },
                { text: 'Inactive', value: false },
              ]}
              filteredValue={getFilteredValue('campaignUsersActive') || [true]}
              render={
                ({
                  active, id,
                }) => (
                  <Tooltip title={
                    permissions.edit ? '' : I18n.t('admin.campaigns_users_no_permission_message')}
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
              width={100}
            />
            <Column
              title={I18n.t('shared.name')}
              key="fullName"
              dataIndex="fullName"
              width={200}
            />
            <Column
              title={I18n.t('shared.email')}
              key="email"
              sorter
              sortOrder={getSortOrder('email')}
              dataIndex="email"
              width={200}
            />
            <Column
              title={I18n.t('admin.dates_started')}
              key="campaignUsersStartedAt"
              dataIndex="startedAt"
              sorter
              sortOrder={getSortOrder('campaignUsersStartedAt')}
              width={200}
            />
            <Column
              title={I18n.t('admin.dates_completed')}
              key="campaignUsersCompletedAt"
              dataIndex="completedAt"
              sorter
              sortOrder={getSortOrder('campaignUsersCompletedAt')}
              width={200}
            />
            <Column
              title={I18n.t('admin.campaigns_users_completion_status')}
              key="campaignUsersCompletionStatus"
              dataIndex="completionStatus"
              sorter
              sortOrder={getSortOrder('campaignUsersCompletionStatus')}
              filters={CompletionStatuses}
              filteredValue={getFilteredValue('campaignUsersCompletionStatus')}
              render={completionStatus => (
                <Tag
                  color={statusToColor[completionStatus]}
                >
                  {I18n.t(`frontend.campaign.users.completion_statuses.${completionStatus}`)}
                </Tag>
              )}
              width={200}
            />
            <Column
              title={I18n.t('shared.status')}
              key="campaignUsersStatus"
              dataIndex="status"
              sorter
              sortOrder={getSortOrder('campaignUsersStatus')}
              filters={UsersStatuses}
              filteredValue={getFilteredValue('campaignUsersStatus')}
              render={status => (
                <Tag
                  color={statusToColor[status]}
                >
                  {I18n.t(`campaign_users.details.statuses.${status}`)}
                </Tag>
              )}
              width={200}
            />
            <Column
              title={I18n.t('admin.campaigns_users_created_by')}
              key="createdBy"
              dataIndex="createdBy"
              width={200}
            />
            <Column
              title={I18n.t('admin.campaigns_users_updated_by')}
              key="updatedBy"
              dataIndex="updatedBy"
              width={200}
            />
            <Column
              title={I18n.t('shared.action')}
              key="action"
              fixed={windowWidth > 800 ? 'right' : undefined}
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
                      aria-label={I18n.t('admin.table_more_actions')}
                      aria-controls={`menu_campaign-subjects-${user.email}`}
                      aria-haspopup
                    >
                      <Tooltip title={I18n.t('admin.table_more_actions')}>
                        <span><MoreOutlined /></span>
                      </Tooltip>
                    </Button>
                  )}
                />
              )}
              width={100}
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
    remove: boolean,
    pushWebhook: boolean,
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
      title: I18n.t('shared.confirm'),
      icon: <ExclamationCircleOutlined />,
      centered: true,
      width: 650,
      content: I18n.t('campaign_users.modals.remove', { email }),
      okText: I18n.t('shared.ok'),
      cancelText: I18n.t('shared.cancel'),
      onOk: () => {
        remove()
        message.success(I18n.t('campaign_users.details.modals.remove.successfully', { email }))
      },
    })
  }

  const menuItems:MenuItem[] = []
  permissions.edit && menuItems.push({
    key: 'edit',
    label: I18n.t('shared.edit'),
  })
  permissions.loginAs && menuItems.push({
    key: 'loginAs',
    label: (
      <a
        href={`/administration/projects/${projectId}/new_campaigns/${campaignId}/users/${id}/spoof`}
      >
        {I18n.t('shared.login')}
      </a>
    ),
  })
  permissions.resetPassword && menuItems.push({
    key: 'changePassword',
    label: I18n.t('shared.reset_password'),
  })
  permissions.remove && menuItems.push({
    key: 'remove',
    label: I18n.t('shared.remove'),
  })

  permissions.pushWebhook && menuItems.push({
    key: 'pushWebhook',
    label: 'Push Webhook',
  })

  const handleMenuClick = ({ key }) => {
    if (key === 'edit') {
      return onEdit()
    }
    if (key === 'changePassword') {
      return openModal('ResetPasswordModal', { user, campaignId })
    }
    if (key === 'remove') {
      return handleDelete()
    }

    if (key === 'pushWebhook') {
      return openModal('PushWebhookModal', {
        campaignId,
        parentType: ParentResourceType.CampaignUser,
        parentId: user.id,
        testMode: false,
        projectId,
      })
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
