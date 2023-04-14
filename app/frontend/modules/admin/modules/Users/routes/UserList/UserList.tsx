
import React, { useState } from 'react'
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
  const config = {
    trackUrl: true,
    apiConfig: { camelizeExcept: ['$[*].enable_2fa', '$.enable_2fa'], filter: { role_eq: userTab } },
    responseType: UserTR,
  }

  return (
    <>
      <Resource config={config} name="users">
        <UserFilter currentUser={currentUser} userTab={userTab} openModal={() => closeModal(false)} />
        <UserTable currentUser={currentUser} openDrawer={setDrawerUser} />
        {!!drawerUser && <DetailsDrawer close={() => setDrawerUser(undefined)} user={drawerUser} />}
        {!closed && <UserFormModal close={() => closeModal(true)} />}
        <Modals modals={MODALS} />
      </Resource>
    </>
  )
}

export const UserList = connecter(UserListComponent)
