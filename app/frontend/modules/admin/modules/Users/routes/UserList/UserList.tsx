
import React, { useEffect, useState } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { PlusOutlined } from '@ant-design/icons'
import {
  Table, Input, Space, Pagination, Button, Menu, Switch, message,
} from 'antd'
import { useResources } from '~/hooks/useResources'
import { TableLayout } from '~/modules/admin/components/TableLayout'
import { User, UserTR } from '~/modules/admin/modules/client/core/users'
import { RootState } from '~/modules/admin/core/rootReducers'
import { ConfirmationModal } from '~/glint'
import Modals from '~/modules/admin/components/Modals'
import { BaseMeta, RemoveResource } from '~/hooks/useResources/interfaces'
import { DetailsDrawer } from './DetailsDrawer'
import { get as getCurrentUser, isSuperAdmin } from '~/core/currentUser'
import ConditionalDropdown from '~/components/ConditionalDropdown'
import { openModal } from '~/modules/admin/core/ui/modals'
import { UserFormModal } from './UserFormModal'

const { Column } = Table
const { Search } = Input
const { I18n } = window

const MODALS = {
  UserFormModal,
}

const connecter = connect(
  (state: RootState) => ({
    currentUser: getCurrentUser(state),
  }),
  {
    openModal,
  },
)

interface OwnProps {
  userRole: string
}

export type PropsFromRedux = ConnectedProps<typeof connecter>
type Props = PropsFromRedux & OwnProps

const UserListComponent: React.FC<Props> = ({
  currentUser, openModal, userRole,
}) => {
  const {
    data, meta, fetch, isLoading, getSortOrder, handleTableChange, changePage, memberAction, collectionAction,
    currentPage, pageSize, changeFilter, getFilteredValue, updateResource, removeResource,
    requests,
  } = useResources<User, BaseMeta>(
    'users',
    {
      trackUrl: true,
      apiConfig: { camelizeExcept: ['$[*].enable_2fa', '$.enable_2fa'], filter: { role_eq: userRole } },
      responseType: UserTR,

    },
  )

  useEffect(() => {
    fetch()
  }, [])

  const [confirmation, setConfirmation] = useState(false)
  const [drawerUser, setDrawerUser] = useState<User | undefined>()
  const [openedDrawer, setOpenedDrawer] = useState(false)

  const createSuperAdmin = (body: Record<string, string | undefined | null>) => collectionAction({
    action: 'create_superadmin',
    method: 'post',
    body,
    updateStore: true,
    responseType: UserTR,
  })

  const resetPassword = (user: User) => memberAction({
    id: user.id,
    action: 'reset_password',
    method: 'post',
  }).then(
    () => message.info(I18n.t('users.actions.reset_password.confirm_message', { email: user.email })),
  ).catch(e => message.error(JSON.stringify(e)))

  const tableLoading = isLoading('fetch')

  const toggleActive = (user: User) => {
    updateResource({
      id: user.id,
      disabled: !user.disabled,
    })
  }

  const toggle2FA = (user) => {
    updateResource({
      id: user.id,
      enable_2fa: !user.enable_2fa,
    }).then((user: User) => {
      message.info(I18n.t(`users.actions.2fa.confirm_message.${user.enable_2fa ? 'enabled' : 'disabled'}`))
    })
  }

  const openDrawer = (user: User) => {
    setOpenedDrawer(true)
    setDrawerUser(user)
  }

  const Filter = (
    <Space>
      <Search
        placeholder={I18n.t('common.actions.search')}
        value={getFilteredValue('filterable_fields')}
        onChange={({ target: { value } }) => { changeFilter('filterable_fields', value) }}
      />
      {isSuperAdmin(currentUser) && userRole === 'Users::SuperAdmin'
        && (
          <Button
            type="primary"
            disabled={tableLoading}
            onClick={() => {
              openModal('UserFormModal', { addUser: createSuperAdmin })
            }}
          >
            <PlusOutlined />
            {I18n.t('users.create_superadmin')}
          </Button>
        )}
    </Space>
  )

  const ClientTable = (
    <>
      <Table
        rowKey={row => row?.id ?? -1}
        dataSource={data}
        pagination={false}
        loading={tableLoading}
        onChange={handleTableChange}
      >
        <Column
          title={I18n.t('common.column.id')}
          key="id"
          sorter
          sortOrder={getSortOrder('id')}
          render={user => <Button type="link" onClick={() => openDrawer(user)}>{user.id}</Button>}
        />
        <Column
          key="disabled"
          title={I18n.t('common.column.active')}
          render={user => <Switch checked={!user.disabled} onChange={() => toggleActive(user)} />}
        />
        <Column
          title={I18n.t('common.column.first_name')}
          key="first_name"
          width={300}
          sorter
          dataIndex="firstName"
          sortOrder={getSortOrder('first_name')}
        />
        <Column
          title={I18n.t('common.column.last_name')}
          key="last_name"
          width={300}
          sorter
          dataIndex="lastName"
          sortOrder={getSortOrder('last_name')}
        />
        <Column
          title={I18n.t('common.column.email')}
          key="email"
          width={300}
          sorter
          dataIndex="email"
          sortOrder={getSortOrder('email')}
        />
        <Column
          title={I18n.t('common.column.updated_at')}
          key="updated_at"
          width={300}
          sorter
          dataIndex="updatedAt"
          sortOrder={getSortOrder('updated_at')}
        />
        {isSuperAdmin(currentUser)
          && (
            <Column
              title={I18n.t('common.column.action')}
              key="action"
              render={user => (
                <ConditionalDropdown
                  menu={
                    ActionsMenu({
                      user,
                      setConfirmation,
                      resetPassword,
                      toggle2FA,
                      confirmation,
                      removeResource,
                    }) as React.ReactElement
                  }
                />
              )}
            />
          )}
      </Table>
      {drawerUser && (
        <DetailsDrawer
          isOpen={openedDrawer}
          close={() => {
            setOpenedDrawer(false)
            setDrawerUser(undefined)
          }}
          memberAction={memberAction}
          user={drawerUser}
        />
      )}
      <Pagination
        current={currentPage}
        pageSize={pageSize}
        total={meta.recordCount}
        onChange={changePage}
        className="pl"
      />
    </>
  )

  return (
    <>
      <TableLayout
        table={ClientTable}
        filters={Filter}
        recordCount={meta.recordCount}
        loading={tableLoading}
        requestStatus={requests.fetch?.status}
      />
      <Modals modals={MODALS} />
    </>
  )
}

interface ActionMenuProps {
  user: User
  setConfirmation: (confirmation: boolean) => void
  resetPassword: (user: User) => void
  toggle2FA: (user: User) => void
  confirmation: boolean
  removeResource: RemoveResource
}

const ActionsMenu: React.FC<ActionMenuProps> = ({
  setConfirmation,
  confirmation,
  removeResource,
  resetPassword,
  toggle2FA,
  user,
}) => {
  const handleOnConfirm = () => removeResource(user.id).then(() => {
    message.info(I18n.t('users.actions.remove.success_message', { email: user.email }))
  }).catch(e => message.error(JSON.stringify(e)))

  const menuItems = [
    {
      key: 'reset_password',
      label: (
        <Button type="link" onClick={() => resetPassword(user)} className="ps-0">
          {I18n.t('users.actions.reset_password.option')}
        </Button>),
    },
    {
      key: '2fa',
      label: (
        <Button type="link" onClick={() => toggle2FA(user)} className="ps-0">
          {I18n.t(`users.actions.2fa.${user.enable_2fa ? 'option_to_disable' : 'option_to_enable'}`)}
        </Button>),
    },
    {
      key: 'remove',
      label: (
        <>
          <Button type="link" onClick={() => setConfirmation(true)} className="ps-0">
            {I18n.t('common.actions.remove')}
          </Button>
          {confirmation && (
            <ConfirmationModal
              title={I18n.t('users.actions.remove.confirm_title')}
              message={I18n.t('users.actions.remove.confirm_message', { email: user.email })}
              onConfirm={handleOnConfirm}
              onCancel={() => setConfirmation(false)}
            />
          )}
        </>
      ),
    },
  ]

  return (
    <Menu items={menuItems} />
  )
}

export const UserList = connecter(UserListComponent)
