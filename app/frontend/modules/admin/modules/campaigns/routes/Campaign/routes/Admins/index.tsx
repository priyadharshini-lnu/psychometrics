import React, { ChangeEvent, FC, useEffect } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import {
  Row,
  Col,
  Space,
  Input,
  Button,
  Pagination,
  Table,
  Modal,
  message,
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import {
  Link, useHistory, useLocation, useParams,
} from 'react-router-dom'

import {
  FETCH as FETCH_CAMPAIGN_ADMINS,
  fetch as fetchAdmins,
  clearSingle as clearSingleAdmin,
  getPermissions as getAdminPermissions,
  getList as getCampaignAdmins,
  getTotal as getTotalCampaignAdmins,
  remove as removeAdmin,
  resetPassword as resetAdminPassword,
  Admin,
} from 'modules/admin/modules/campaigns/core/admins'
import { isRequestInProgress } from 'modules/admin/core/request'
import { TableProps } from 'modules/admin/hoc/withEnhancedTable/interfaces'
import { RootState } from 'modules/admin/core/rootReducers'

import { CountDisplay } from 'components/CountDisplay'
import withEnhancedTable from 'modules/admin/hoc/withEnhancedTable'
import settings from 'modules/admin/settings'
import { DetailsDrawer } from './DetailsDrawer'
import { AddEditDrawer } from './AddEditDrawer'
import { ActionsMenu } from './ActionsMenu'
import { DrawerMode, DRAWER_SEARCH_PARAMS } from './constants'

const { I18n } = window

const connector = connect(
  (state: RootState) => ({
    adminList: getCampaignAdmins(state),
    isAdminListLoading: isRequestInProgress(state, FETCH_CAMPAIGN_ADMINS),
    totalAdmins: getTotalCampaignAdmins(state),
    adminPermissions: getAdminPermissions(state),
  }),
  {
    fetchAdmins,
    clearSingleAdmin,
    removeAdmin,
    resetAdminPassword,
  },
)

type PropsFromRedux = ConnectedProps<typeof connector>

type Props = PropsFromRedux & TableProps

const AdminsComponent: FC<Props> = ({
  tableConfig: { filters, page },
  tableConfig,
  changeFilter,
  getSortOrder,
  changePage,
  onTableChange,
  fetchAdmins,
  clearSingleAdmin,
  adminList,
  isAdminListLoading,
  totalAdmins,
  adminPermissions,
  removeAdmin,
  resetAdminPassword,
}) => {
  const params = useParams<{ campaignId: string; projectId: string }>()
  const campaignId = parseInt(params.campaignId, 10)
  const projectId = parseInt(params.projectId, 10)

  const { pathname, search } = useLocation()
  const searchParams = new URLSearchParams(search)
  const drawerMode = searchParams.get(DRAWER_SEARCH_PARAMS.MODE) as DrawerMode
  const drawerAdminId = searchParams.get(
    DRAWER_SEARCH_PARAMS.ADMIN_ID,
  ) as string

  const history = useHistory()

  const getIndividualAdminUrl = (
    mode: DrawerMode,
    id?: Admin['id'],
  ): string => {
    const params = new URLSearchParams(search)

    if (mode === DrawerMode.Edit || mode === DrawerMode.View) {
      params.set(DRAWER_SEARCH_PARAMS.ADMIN_ID, `${id}`)
    }

    params.set(DRAWER_SEARCH_PARAMS.MODE, mode)

    return `${pathname}?${params.toString()}`
  }

  useEffect(() => {
    fetchAdmins(campaignId, tableConfig)
    clearSingleAdmin()
  }, [tableConfig])

  const handleSearchInput = (event: ChangeEvent<HTMLInputElement>) => {
    const {
      target: { value },
    } = event
    changeFilter('filterableFields', value)
  }

  const handleEditAdminClick = (id: Admin['id']) => {
    clearSingleAdmin()

    const editUrl = getIndividualAdminUrl(DrawerMode.Edit, id)
    history.push(editUrl)
  }

  const handleAddAdminClick = () => {
    clearSingleAdmin()

    const addUrl = getIndividualAdminUrl(DrawerMode.Add)
    history.push(addUrl)
  }

  const handleDeleteAdminClick = (id: Admin['id']) => {
    const admin = adminList.find(admin => admin.id === id)
    const name = `${admin?.firstName ?? ''} ${admin?.lastName ?? ''}`

    Modal.confirm({
      title: I18n.t('administration.administrators.modals.delete.title'),
      content: I18n.t('administration.administrators.modals.delete.content', {
        name,
      }),
      okText: I18n.t('administration.administrators.modals.delete.okText'),
      cancelText: I18n.t(
        'administration.administrators.modals.delete.cancelText',
      ),
      onOk: async () => {
        try {
          await removeAdmin(campaignId, id)

          message.success(
            I18n.t('administration.administrators.modals.delete.onSuccess', {
              name,
            }),
          )
        } catch (error) {
          message.error(
            I18n.t('administration.administrators.modals.delete.onFailed', {
              name,
            }),
          )
        }
      },
    })
  }

  const handlePasswordResetClick = (id: Admin['id']) => {
    const admin = adminList.find(admin => admin.id === id)
    const email = admin?.email ?? ''

    Modal.confirm({
      title: I18n.t('administration.administrators.modals.resetPassword.title'),
      content: I18n.t(
        'administration.administrators.modals.resetPassword.content',
        { email },
      ),
      okText: I18n.t(
        'administration.administrators.modals.resetPassword.okText',
      ),
      cancelText: I18n.t(
        'administration.administrators.modals.resetPassword.cancelText',
      ),
      onOk: async () => {
        try {
          await resetAdminPassword(campaignId, id)

          message.success(
            I18n.t(
              'administration.administrators.modals.resetPassword.onSuccess',
              { email },
            ),
          )
        } catch (error) {
          message.error(
            I18n.t(
              'administration.administrators.modals.resetPassword.onFailed',
              { email },
            ),
          )
        }
      },
    })
  }

  const handleDrawerClose = () => {
    clearSingleAdmin()

    const searchParams = new URLSearchParams(search)
    searchParams.delete(DRAWER_SEARCH_PARAMS.MODE)
    searchParams.delete(DRAWER_SEARCH_PARAMS.ADMIN_ID)

    history.push(`${pathname}?${searchParams.toString()}`)
  }

  useEffect(
    () => () => {
      clearSingleAdmin()
      Modal.destroyAll()
    },
    [],
  )

  return (
    <>
      <Row
        justify="space-between"
        align="middle"
        className="pt-4 pb-4 ps-4 pe-4"
      >
        <Col>
          <CountDisplay
            selectedCount={0}
            totalCount={totalAdmins}
            isLoading={isAdminListLoading}
          />
        </Col>
        <Col>
          <Space>
            <Input.Search
              placeholder={I18n.t(
                'administration.administrators.list.header.search_admins',
              )}
              value={filters.filterableFields}
              onChange={handleSearchInput}
            />
            {adminPermissions.create && (
              <Button
                type="primary"
                disabled={isAdminListLoading}
                onClick={handleAddAdminClick}
              >
                <PlusOutlined />
                {I18n.t('administration.administrators.list.header.add_admin')}
              </Button>
            )}
          </Space>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <Table
            rowKey={row => row?.id ?? -1}
            pagination={false}
            loading={isAdminListLoading}
            dataSource={adminList}
            onChange={onTableChange}
          >
            <Table.Column
              key="userId"
              dataIndex="userId"
              title={I18n.t('administration.administrators.list.columns.id')}
              sorter
              sortOrder={getSortOrder('userId')}
            />
            <Table.Column
              key="name"
              dataIndex="name"
              title={I18n.t('administration.administrators.list.columns.name')}
              sorter
              sortOrder={getSortOrder('name')}
              render={(_, { id, firstName, lastName }) => (
                <Link to={getIndividualAdminUrl(DrawerMode.View, id)}>
                  <Button type="link" className="ps-0">
                    {`${firstName} ${lastName}`}
                  </Button>
                </Link>
              )}
            />
            <Table.Column
              key="email"
              dataIndex="email"
              title={I18n.t('administration.administrators.list.columns.email')}
              sorter
              sortOrder={getSortOrder('email')}
            />
            <Table.Column
              key="createdAt"
              dataIndex="createdAt"
              title={I18n.t(
                'administration.administrators.list.columns.created_at',
              )}
              sorter
              sortOrder={getSortOrder('createdAt')}
            />
            <Table.Column
              key="actions"
              dataIndex="actions"
              title={I18n.t(
                'administration.administrators.list.columns.actions',
              )}
              render={(_, { id, email, permissions }) => (
                <ActionsMenu
                  id={id}
                  email={email}
                  campaignId={campaignId}
                  permissions={permissions}
                  handleEdit={handleEditAdminClick}
                  handleDelete={handleDeleteAdminClick}
                  handleResetPassword={handlePasswordResetClick}
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
            current={page}
            pageSize={settings.pagination.defaultPageSize}
            total={totalAdmins}
            onChange={changePage}
          />
        </Col>
      </Row>
      <DetailsDrawer
        isVisible={drawerMode === DrawerMode.View}
        projectId={projectId}
        campaignId={campaignId}
        adminId={drawerAdminId}
        handleClose={handleDrawerClose}
        handleEdit={handleEditAdminClick}
      />
      <AddEditDrawer
        isVisible={
          drawerMode === DrawerMode.Add || drawerMode === DrawerMode.Edit
        }
        isEditMode={drawerMode === DrawerMode.Edit}
        isAddMode={drawerMode === DrawerMode.Add}
        campaignId={campaignId}
        adminId={drawerAdminId}
        handleClose={handleDrawerClose}
      />
    </>
  )
}

export const Admins = withEnhancedTable(
  connector(AdminsComponent),
  'campaignAdmins',
  {
    maintainHistory: true,
  },
)
