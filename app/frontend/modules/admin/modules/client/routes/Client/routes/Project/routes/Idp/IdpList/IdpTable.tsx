import React from 'react'
import { connect, ConnectedProps } from 'react-redux'
// import _ from 'lodash'
// import { MenuProps } from 'antd'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import { Idp } from '~/modules/admin/modules/client/core/idp'
import { openModal } from '~/modules/admin/core/ui/modals'
import { RootState } from '~/modules/admin/core/rootReducers'
import IdpFilter from './IdpFilter'
import IDPTemplateForm from './IDPTemplateForm'
import Modals from '~/modules/admin/components/Modals'
// import ConditionalDropdown from '~/components/ConditionalDropdown'

const { I18n } = window

const MODALS = {
  IDPTemplateForm,
}

const connector = connect(
  (state: RootState) => ({
    currentUser: state.currentUser,
  }),
  {
    openModal,
  },
)

type PropsFromRedux = ConnectedProps<typeof connector>;
type Props = PropsFromRedux;

const IdpTable: React.FC<Props> = ({ openModal }) => {
  const { resource } = useResourceContext<Idp>()
  const { getSortOrder } = resource

  return (
    <>
      <IdpFilter openModal={() => openModal('IDPTemplateForm')} />
      <Resource.Table pagination>
        <Resource.Column<Idp>
          title={I18n.t('common.column.id')}
          dataIndex="id"
          id="id"
          width={200}
          sorter
          sortOrder={getSortOrder('id')}
        />
        <Resource.Column<Idp>
          title={`${I18n.t('common.column.name')}`}
          id="name"
          render={item => item?.name}
          sorter
        />

        <Resource.Column<Idp>
          title={`${I18n.t('common.column.description')}`}
          id="description"
          render={item => item?.description}
          sorter
        />

        <Resource.Column<Idp>
          title={I18n.t('common.column.action')}
          id="action"
          width={100}
          // render={idp => (
          //   <ConditionalDropdown
          //     menu={
          //       getActionMenuProps({
          //         idp,
          //       })
          //     }
          //   />
          // )}
        />
      </Resource.Table>
      <Modals modals={MODALS} />
    </>
  )
}

// interface ActionMenuData {
//   idp: Idp
// }

// const getActionMenuProps = ({
//   idp,
// }: ActionMenuData): MenuProps => {
//   const menuItems = [
//     { key: 'edit', label: I18n.t('common.actions.edit') },
//   ]

//   const handleMenuClick = ({ key }) => {
//     if (key === 'edit') {
//       return openModal('IDPTemplateForm', { idp })
//     }
//     return null
//   }

//   return ({ items: _.compact(menuItems), onClick: handleMenuClick })
// }

export default connector(IdpTable)
