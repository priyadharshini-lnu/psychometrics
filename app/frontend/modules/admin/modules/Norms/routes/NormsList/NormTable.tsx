import React from 'react'
import _ from 'lodash'
import * as t from 'io-ts'
import { MenuProps, Switch, message } from 'antd'
import { connect, ConnectedProps } from 'react-redux'
import { Link } from 'react-router-dom'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import { Norm } from '~/modules/admin/modules/client/core/norms'
import Modals from '~/modules/admin/components/Modals'
import { openModal } from '~/modules/admin/core/ui/modals'
import { RemoveResource, UpdateResource, MemberAction } from '~/hooks/useResources/interfaces'
import ConditionalDropdown from '~/components/ConditionalDropdown'
import { get as getCurrentUser } from '~/core/currentUser'
import { RootState } from '~/modules/admin/core/rootReducers'
import { RemoveNormModal } from './RemoveNormModal'
import { NormsFormModal } from './NormsFormModal'
import CopyNomsFormModal from './CopyNormsFormModal'
import NormFilter from './NormFilter'
import { NormImportModal } from './NormImportModal'

const { I18n } = window

const MODALS = {
  NormsFormModal,
  RemoveNormModal,
  CopyNomsFormModal,
  NormImportModal,
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
    getSortOrder, updateResource, removeResource, memberAction,
  } = resource

  return (
    <>
      <NormFilter
        openModal={openModal}
      />
      <Resource.Table pagination>
        <Resource.Column<Norm>
          title={I18n.t('common.column.id')}
          id="id"
          sorter
          sortOrder={getSortOrder('id')}
          width={150}
        />
        <Resource.Column<Norm>
          id="disabled"
          title={I18n.t('common.column.active')}
          render={norm => <ActiveSwitch norm={norm} updateResource={updateResource} />}
          width={100}
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
          id="dimension.name"
          render={(_, { dimension }) => dimension?.id && (
            <a href={`/administration/dimensions/${dimension.id}/factors`}>{dimension.name}</a>
          )}
          sorter
        />
        <Resource.Column<Norm>
          title={`${I18n.t('administration.campaigns.users.updated_by')}`}
          id="updated_by.name"
          render={(_, { updatedBy }) => updatedBy?.name}
          width={200}
          sorter
        />
        <Resource.Column<Norm>
          title={`${I18n.t('common.column.owner')}`}
          id="owner.name"
          width={200}
          sorter
          render={(_, { owner }) => owner?.id && (
            <Link to={`/admin/clients/${owner.id}/projects`}>{owner.name}</Link>
          )}
        />
        <Resource.Column<Norm>
          title={`${I18n.t('common.column.created_at')}`}
          id="createdAt"
          width={150}
          sorter
          render={(_, { createdAt }) => createdAt}
        />
        <Resource.Column<Norm>
          title={`${I18n.t('common.column.updated_at')}`}
          id="updatedAt"
          sorter
          width={150}
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
                      removeResource,
                      openModal,
                      memberAction,
                    })
                }
            />
          )}
          width={100}
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
    removeResource: RemoveResource
    openModal: (modalName: string, modalProps: unknown) => void
    memberAction: MemberAction
}

const getActionMenuProps = ({
  norm, removeResource, openModal, memberAction,
}: ActionMenuData): MenuProps => {
  const {
    id, name, meta: { permissions }, normType,
  } = norm

  const exportNorm = (normId: string) => memberAction({
    id: normId,
    action: 'export',
    method: 'post',
    responseType: t.literal('ok'),
  }).then(() => {
    message.success(I18n.t('administration.norms.export.success_msg'))
  })

  const menuItems = [
    permissions.edit && { key: 'edit', label: I18n.t('common.actions.edit') },
    permissions.delete && { key: 'remove', label: I18n.t('common.actions.remove') },
    permissions.copy && { key: 'copy', label: I18n.t('common.actions.copy') },
    permissions.export && normType === 'five_scale' && {
      key: 'export_norm', label: I18n.t('administration.norms.sidebar.export'),
    },
    permissions.editor && {
      key: 'norm_editor',
      label: (
        <a href={`/administration/norms/${norm.id}/editor`}>
          {I18n.t('administration.norms.sidebar.editor')}
        </a>
      ),
    },
  ]

  const handleMenuClick = ({ key }) => {
    if (key === 'edit') {
      return openModal('NormsFormModal', { norm })
    }
    if (key === 'remove') {
      return openModal('RemoveNormModal', {
        id, name, removeResource, norm,
      })
    }
    if (key === 'copy') {
      return openModal('CopyNomsFormModal', { norm })
    }
    if (key === 'export_norm') {
      return exportNorm(norm.id)
    }
  }

  return ({ items: _.compact(menuItems), onClick: handleMenuClick })
}

export default connecter(NormTable)
