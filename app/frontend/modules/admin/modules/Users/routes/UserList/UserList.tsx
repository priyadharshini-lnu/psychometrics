import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { connect, ConnectedProps } from 'react-redux'
import { Resource } from '~/modules/admin/components/Resource'
import { User, UserTR } from '~/modules/admin/modules/client/core/users'
import { RootState } from '~/modules/admin/core/rootReducers'
import { DetailsDrawer } from './DetailsDrawer'
import { get as getCurrentUser } from '~/core/currentUser'
import { ResetPasswordModal } from './ResetPasswordModal'
import Modals from '~/modules/admin/components/Modals'
import { UserFormModal } from './UserFormModal'
import { UserTable } from './UserTable'
import { UserFilter } from './UserFilter'
import { Tabs } from './Tabs'
import Breadcrumb from '~/modules/admin/modules/campaigns/components/Breadcrumb'

const { I18n } = window

const MODALS = {
  ResetPasswordModal,
}

const connecter = connect(
  (state: RootState) => ({
    currentUser: getCurrentUser(state),
  }),
  {},
)

interface OwnProps {
  userTab: string
}

export type PropsFromRedux = ConnectedProps<typeof connecter>
type Props = PropsFromRedux & OwnProps


const UserListComponent: React.FC<Props> = ({
  currentUser, userTab,
}) => {
  const [drawerUser, setDrawerUser] = useState<User | undefined>()
  const [closed, closeModal] = useState(true)
  let filter: Record<string, string | string[]> = { role_eq: userTab }
  if (userTab === 'Users::GlobalAssessors') {
    filter = { role_in: ['Users::Admin', 'Users::SuperAdmin'], global_assessor_eq: 'true' }
  }
  const config = {
    trackUrl: true,
    apiConfig: {
      camelizeExcept: ['$[*].enable_2fa', '$.enable_2fa'],
      filter,
      include_resource_meta: ['permissions'],
    },
    responseType: UserTR,
  }

  return (
    <Resource config={config} name="users">
      <UserFilter currentUser={currentUser} userTab={userTab} openModal={() => closeModal(false)} />
      <UserTable currentUser={currentUser} userTab={userTab} openDrawer={setDrawerUser} />
      {!!drawerUser && <DetailsDrawer close={() => setDrawerUser(undefined)} user={drawerUser} />}
      {!closed && <UserFormModal close={() => closeModal(true)} userTab={userTab} />}
      <Modals modals={MODALS} />
    </Resource>
  )
}

// The tab strip belongs to the route above the tabs, so switching tabs swaps only the list below it.
export const UsersLayout: React.FC = () => (
  <>
    <Breadcrumb
      crumbs={[
        {
          link: () => '/admin',
          label: () => I18n.t('users.dashboard'),
        },
        {
          label: () => I18n.t('users.users'),
        },
      ]}
    />
    <Tabs />
    <Outlet />
  </>
)

const UserList = connecter(UserListComponent)

export const RegularUsers = () => <UserList userTab="Users::Regular" />
export const AdminUsers = () => <UserList userTab="Users::Admin" />
export const SuperAdminUsers = () => <UserList userTab="Users::SuperAdmin" />
export const GlobalAssessorUsers = () => <UserList userTab="Users::GlobalAssessors" />

export default UserList
