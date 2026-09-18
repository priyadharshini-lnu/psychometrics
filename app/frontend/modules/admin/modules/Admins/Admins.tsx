import React, { useEffect } from 'react'
import _ from 'lodash'
import * as t from 'io-ts'
import { connect, ConnectedProps } from 'react-redux'
import {
  Table,
  Space,
  Button,
  Input,
  message,
  App,
  Typography,
} from 'antd'
import {
  Link, useParams, useLocation, useNavigate,
} from 'react-router-dom'
import { PlusOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { get as getCurrentUser, isSuperAdmin } from '~/core/currentUser'
import { openModal } from '~/modules/admin/core/ui/modals'
import { useResources } from '~/hooks/useResources'
import { BaseMeta } from '~/hooks/useResources/interfaces'
import { RootState } from '~/modules/admin/core/rootReducers'
import { TableLayout } from '~/modules/admin/components/TableLayout'
import {
  ProjectAdmin, Admin, AdminPermissions, CurrentUserPermissions, AdminListingTR,
} from '~/modules/admin/modules/client/core/admin'
import { ResetPasswordModal } from '~/modules/admin/modules/Users/routes/UserList/ResetPasswordModal'
import Modals from '~/modules/admin/components/Modals/'
import { DetailsDrawer } from './DetailsDrawer'
import { AddEditDrawer } from './AddEditDrawer'
import { ActionsMenu } from './ActionsMenu'
import {
  DrawerMode, DRAWER_SEARCH_PARAMS, AdminTypes,
} from './constants'
import ToolsDropdown from './ToolsDropdown'

const MODALS = {
  ResetPasswordModal,
}

const connecter = connect(
  (state: RootState) => ({
    currentUser: getCurrentUser(state),
  }),
  {
    openModal,
  },
)

type PropsFromRedux = ConnectedProps<typeof connecter>

interface OwnProps {
  adminType: string
  campaignType?: string
}

type Props = PropsFromRedux & OwnProps

const { I18n } = window

export interface Meta extends BaseMeta {
  permissions: AdminPermissions
  usersGrants: CurrentUserPermissions
}

const AdminsComponent: React.FC<Props> = ({
  adminType, campaignType, currentUser, openModal,
}) => {
  const {
    projectId,
    clientId,
    campaignId,
  } = useParams() as { campaignId: string; projectId: string; clientId: string }
  const { modal } = App.useApp()
  const filterHash = {
    with_role: adminType,
    project_id_eq: projectId,
  }

  if (adminType === AdminTypes.CampaignAdmin) {
    _.merge(filterHash, { campaign_id_eq: campaignId })
  } else if (adminType === AdminTypes.ClientAdmin) {
    _.merge(filterHash, { client_id_eq: clientId })
  }

  const {
    data, meta, fetch, isLoading, getSortOrder, handleTableChange, createResource, updateResource,
    removeResource, currentPage, pageSize, changePage, getFilteredValue, changeFilter, getErrors,
    collectionAction,
  } = useResources<ProjectAdmin, Meta>(
    'memberships',
    {
      trackUrl: true,
      responseType: AdminListingTR,
      apiConfig: {
        filter: filterHash,
        fields: {
          memberships: ['first_name', 'last_name', 'email', 'created_at', 'user_id'],
        },
      },
    },
  )

  const createRequestErrors = getErrors('add')

  useEffect(() => {
    fetch()
  }, [])

  const tableLoading = isLoading('fetch')

  const { search } = useLocation()
  const searchParams = new URLSearchParams(search)
  const drawerMode = searchParams.get(DRAWER_SEARCH_PARAMS.MODE) as DrawerMode
  const drawerAdminId = searchParams.get(
    DRAWER_SEARCH_PARAMS.ADMIN_ID,
  ) as string

  const updateInProgress = isLoading(`update@${drawerAdminId}`)
  const createAdminInProgress = isLoading('add')

  const navigate = useNavigate()

  const getIndividualAdminUrl = (
    mode: DrawerMode,
    id?: Admin['id'],
  ): string => {
    const params = new URLSearchParams(search)

    if (mode === DrawerMode.Edit || mode === DrawerMode.View) {
      params.set(DRAWER_SEARCH_PARAMS.ADMIN_ID, `${id}`)
    }

    params.set(DRAWER_SEARCH_PARAMS.MODE, mode)

    return `?${params.toString()}`
  }

  const handleEditAdminClick = (id: Admin['id']) => {
    const editUrl = getIndividualAdminUrl(DrawerMode.Edit, id)
    navigate(editUrl)
  }

  const handleDeleteAdminClick = (
    id: Admin['id'], firstName: Admin['firstName'], lastName: Admin['lastName'], email: Admin['email'],
  ) => {
    modal.confirm({
      title: I18n.t('shared.confirm'),
      content: I18n.t(
        'admin.confirm_remove_admin',
        { email },
      ),
      okText: I18n.t('shared.ok'),
      cancelText: I18n.t('shared.cancel'),
      onOk: async () => {
        removeResource(`${id}`).then(() => {
          message.info(
            I18n.t('admin.admin_removed_successfully', { email }),
          )
          close()
        }).catch((error) => {
          message.error(error)
        })
      },
    })
  }

  const handleDrawerClose = () => {
    const searchParams = new URLSearchParams(search)
    searchParams.delete(DRAWER_SEARCH_PARAMS.MODE)
    searchParams.delete(DRAWER_SEARCH_PARAMS.ADMIN_ID)

    navigate(`?${searchParams.toString()}`)
  }

  const handleAddAdminClick = () => {
    const addUrl = getIndividualAdminUrl(DrawerMode.Add)
    navigate(addUrl)
  }

  const handleExportAdminsClick = () => {
    collectionAction({
      action: 'export',
      method: 'post',
      body: { clientId, projectId, campaignId },
      responseType: t.literal('ok'),
    }).then(() => {
      message.success(I18n.t('admin.admin_export_scheduled'))
    })
  }

  const AdminsTable = (
    <Table
      pagination={false}
      scroll={{ x: 'max-content' }}
      rowKey="id"
      dataSource={data}
      onChange={handleTableChange}
    >
      <Table.Column
        dataIndex="userId"
        key="userId"
        fixed="left"
        title={I18n.t('shared.id')}
        sorter
        sortOrder={getSortOrder('userId')}
      />
      <Table.Column
        dataIndex="name"
        title={I18n.t('shared.name')}
        render={(_, { id, firstName, lastName }) => (
          <Link to={getIndividualAdminUrl(DrawerMode.View, id)}>
            <Button type="link" className="ps-0">
              {`${firstName} ${lastName}`}
            </Button>
          </Link>
        )}
      />
      <Table.Column
        dataIndex="email"
        key="user.email"
        title={I18n.t('shared.email')}
        sorter
        sortOrder={getSortOrder('user.email')}
        render={(_, { email }) => (
          <Typography.Paragraph copyable>
            {email}
          </Typography.Paragraph>
        )}
      />
      <Table.Column
        dataIndex="createdAt"
        key="createdAt"
        title={I18n.t('shared.created_at')}
        sorter
        sortOrder={getSortOrder('createdAt')}
      />
      <Table.Column
        dataIndex="actions"
        fixed="right"
        title={I18n.t('shared.actions')}
        render={(
          _,
          user: Admin,
        ) => {
          const {
            id, userId, email, firstName, lastName,
          } = user

          return (
            <ActionsMenu
              id={id}
              userId={userId}
              currentUser={currentUser}
              email={email}
              firstName={firstName}
              lastName={lastName}
              permissions={meta.permissions}
              handleEdit={handleEditAdminClick}
              handleDelete={handleDeleteAdminClick}
              handleResetPassword={() => openModal('ResetPasswordModal', { user: { ...user, id: user.userId } })}
            />
          )
        }}
      />
    </Table>
  )

  const Filter = (
    <Space>
      <Input.Search
        placeholder={I18n.t('admin.search_admins')}
        value={getFilteredValue('filterable_fields')}
        onChange={e => changeFilter('filterable_fields', e.target.value)}
      />
      <ToolsDropdown
        permissions={meta.permissions}
        onExportAdminsWithPermissions={handleExportAdminsClick}
      />
      <Button
        type="primary"
        disabled={tableLoading}
        onClick={handleAddAdminClick}
      >
        <PlusOutlined />
        {I18n.t('admin.add_admin')}
      </Button>
    </Space>
  )

  return (
    <>
      <TableLayout
        loading={tableLoading}
        table={AdminsTable}
        filters={Filter}
        title={I18n.t('admin.admins')}
        pagination={{
          page: currentPage,
          pageSize,
          total: meta.recordCount ?? 0,
          onChange: changePage,
        }}
        recordCount={meta.recordCount}
      />
      <DetailsDrawer
        isOpen={drawerMode === DrawerMode.View}
        adminId={drawerAdminId}
        permissions={meta.permissions}
        handleClose={handleDrawerClose}
        handleEdit={handleEditAdminClick}
        adminType={adminType}
      />
      <AddEditDrawer
        isOpen={
          drawerMode === DrawerMode.Add || drawerMode === DrawerMode.Edit
        }
        isEditMode={drawerMode === DrawerMode.Edit}
        handleClose={handleDrawerClose}
        updateAdmin={updateResource}
        createAdmin={createResource}
        requestErrors={createRequestErrors}
        isSuperAdmin={isSuperAdmin(currentUser)}
        permissions={meta.permissions}
        currentUserGrants={meta.usersGrants}
        adminId={drawerAdminId}
        adminType={adminType}
        campaignType={campaignType}
        addOrUpdateInProgress={updateInProgress || createAdminInProgress}
      />
      <Modals modals={MODALS} />
    </>
  )
}

export const Admins = connecter(AdminsComponent)
