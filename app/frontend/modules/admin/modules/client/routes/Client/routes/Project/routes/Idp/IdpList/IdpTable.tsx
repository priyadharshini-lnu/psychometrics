import React from 'react'
import { connect, ConnectedProps } from 'react-redux'
import _ from 'lodash'
import { MenuProps } from 'antd'
import { RemoveResource } from 'hooks/useResources/interfaces'
import { useParams } from 'react-router-dom'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import { Idp } from '~/modules/admin/modules/client/core/idp'
import { openModal } from '~/modules/admin/core/ui/modals'
import { RootState } from '~/modules/admin/core/rootReducers'
import IdpFilter from './IdpFilter'
import IDPTemplateForm from './IDPTemplateForm'
import Modals from '~/modules/admin/components/Modals'
import ConditionalDropdown from '~/components/ConditionalDropdown'
import RemoveIdTemplate from './RemoveIdpTemplateModal'
import { getClientId } from '~/modules/admin/modules/client/core/projects'

const { I18n } = window

const MODALS = {
  IDPTemplateForm,
  RemoveIdTemplate,
}

const connector = connect(
  (state: RootState) => ({
    clientId: getClientId(state),
  }),
  {
    openModal,
  },
)

type PropsFromRedux = ConnectedProps<typeof connector>;
type Props = PropsFromRedux;

const IdpTable: React.FC<Props> = ({ openModal, clientId }) => {
  const { resource } = useResourceContext<Idp>()
  const { getSortOrder, removeResource } = resource
  const { projectId } = useParams() as { projectId: string }

  return (
    <>
      <IdpFilter openModal={() => openModal('IDPTemplateForm', { projectId, clientId })} />
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
          title={`${I18n.t('administration.idp.skill_gap_report')}`}
          id="description"
          render={item => item?.report?.name}
        />

        <Resource.Column<Idp>
          title={I18n.t('common.column.action')}
          id="action"
          width={100}
          render={idp => (
            <ConditionalDropdown
              menu={
                getActionMenuProps({
                  openModal,
                  idp,
                  removeResource,
                  projectId,
                  clientId,
                })
              }
            />
          )}
        />
      </Resource.Table>
      <Modals modals={MODALS} />
    </>
  )
}

interface ActionMenuData {
  idp: Idp,
  openModal: (modalName: string, modalProps: unknown) => void,
  removeResource: RemoveResource,
  projectId: string,
  clientId: string,
}

const getActionMenuProps = ({
  idp,
  openModal,
  removeResource,
  projectId,
  clientId,
}: ActionMenuData): MenuProps => {
  const menuItems = [
    { key: 'edit', label: I18n.t('common.actions.edit') },
    { key: 'remove', label: I18n.t('common.actions.remove') },
  ]

  const handleMenuClick = ({ key }) => {
    if (key === 'edit') {
      return openModal('IDPTemplateForm', { idp, projectId, clientId })
    }
    if (key === 'remove') {
      return openModal('RemoveIdTemplate', { idp, removeIdp: removeResource })
    }
    return null
  }

  return ({ items: _.compact(menuItems), onClick: handleMenuClick })
}

export default connector(IdpTable)
