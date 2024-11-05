import React from 'react'
import _ from 'lodash'
import { MenuProps, Switch } from 'antd'
import { connect, ConnectedProps } from 'react-redux'
import { Link } from 'react-router-dom'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import { Norm } from '~/modules/admin/modules/client/core/norms'
import Modals from '~/modules/admin/components/Modals'
import { openModal } from '~/modules/admin/core/ui/modals'
import { RemoveResource, UpdateResource } from '~/hooks/useResources/interfaces'
import ConditionalDropdown from '~/components/ConditionalDropdown'
import { get as getCurrentUser } from '~/core/currentUser'
import { RootState } from '~/modules/admin/core/rootReducers'
import { RemoveNormModal } from './RemoveNormModal'
import { NormsFormModal } from './NormsFormModal'
import CopyNomsFormModal from './CopyNormsFormModal'
import NormFilter from './NormFilter'

const { I18n } = window

const MODALS = {
  NormsFormModal,
  RemoveNormModal,
  CopyNomsFormModal,
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
type Props = PropsFromRedux

const NormTable: React.FC<Props> = ({ openModal }) => {
  const { resource } = useResourceContext<Norm>()
  const {
    getSortOrder, updateResource, removeResource, createResource,
  } = resource

  return (
    <>
      <NormFilter openModal={() => openModal('NormsFormModal', { addNorm: createResource })} />
      <Resource.Table pagination>
        <Resource.Column<Norm>
          title={I18n.t('common.column.id')}
          id="id"
          sorter
          sortOrder={getSortOrder('id')}
        />
        <Resource.Column<Norm>
          id="disabled"
          title={I18n.t('common.column.active')}
          render={norm => <ActiveSwitch norm={norm} updateResource={updateResource} />}
        />
        <Resource.Column<Norm>
          title={`${I18n.t('common.column.name')}`}
          id="name"
          width={300}
          render={item => item?.name}
          sorter
        />
        <Resource.Column<Norm>
          title={I18n.t('common.column.dimension')}
          width={300}
          id="dimension"
          render={(_, { dimension }) => (
            <Link to={`/administration/dimensions/${dimension.id}/factors`}>{dimension?.name}</Link>
          )}
          sorter
        />
        <Resource.Column<Norm>
          title={`${I18n.t('administration.campaigns.users.updated_by')}`}
          id="updatedBy"
          width={300}
          sorter
          render={(_, { updatedBy }) => updatedBy.name}
        />
        <Resource.Column<Norm>
          title={`${I18n.t('common.column.owner')}`}
          id="owner"
          width={300}
          sorter
          render={(_, { owner }) => (
            <Link to={`/admin/clients/${owner.id}/projects`}>{owner?.name}</Link>
          )}
        />
        <Resource.Column<Norm>
          title={`${I18n.t('common.column.created_at')}`}
          id="createdAt"
          width={300}
          render={(_, { createdAt }) => createdAt}
        />
        <Resource.Column<Norm>
          title={`${I18n.t('common.column.updated_at')}`}
          id="updatedAt"
          width={300}
          render={(_, { updatedAt }) => updatedAt}
        />
        <Resource.Column<Norm>
          title={I18n.t('common.column.action')}
          id="action"
          render={norm => (
            <ConditionalDropdown
              menu={
                    getActionMenuProps({
                      norm,
                      updateResource,
                      removeResource,
                      openModal,
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

const ActiveSwitch: React.FC<{ norm: Norm, updateResource: UpdateResource<Norm> }> = ({ norm, updateResource }) => (
  <Switch
    checked={!norm.disabled}
    onChange={() => updateResource({ id: norm.id, disabled: !norm.disabled })}
  />
)
interface ActionMenuData {
    norm: Norm
    updateResource: UpdateResource<Norm>
    removeResource: RemoveResource
    openModal: (modalName: string, modalProps: unknown) => void
}

const getActionMenuProps = ({
  norm, updateResource, removeResource, openModal,
}: ActionMenuData): MenuProps => {
  const { id, name } = norm
  const menuItems = [
    { key: 'edit', label: I18n.t('common.actions.edit') },
    { key: 'remove', label: I18n.t('common.actions.remove') },
    { key: 'copy', label: I18n.t('common.actions.copy') },
    { key: 'export_norm', label: I18n.t('administration.norms.sidebar.export') },
  ]

  const handleMenuClick = ({ key }) => {
    if (key === 'edit') {
      return openModal('NormsFormModal', {
        updateNorm: updateResource, norm,
      })
    }
    if (key === 'remove') {
      return openModal('RemoveNormModal', {
        id, name, removeResource, norm,
      })
    }
    if (key === 'copy') {
      return openModal('CopyNomsFormModal', { norm })
    }
  }

  return ({ items: _.compact(menuItems), onClick: handleMenuClick })
}

export default connecter(NormTable)
