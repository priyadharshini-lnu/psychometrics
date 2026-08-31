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
import { PlaceholderText } from '~/components/PlaceholderText'
import { get as getCurrentUser } from '~/core/currentUser'
import { getFeatures } from '~/core/config'
import { camelizeKeys } from '~/utils/object'
import { useIsOwnedPath } from '~/components/AdminShell/ownedPaths'
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

const getNormEditorUrl = (normId: string, features: Record<string, boolean>) => (
  camelizeKeys(features ?? {})?.normEditorNewUi
    ? `/admin/norms/${normId}/editor`
    : `/administration/norms/${normId}/editor`
)

const getDimensionFactorsUrl = (dimensionId: string, features: Record<string, boolean>) => (
  camelizeKeys(features ?? {})?.normEditorNewUi
    ? `/admin/dimensions/${dimensionId}/factors`
    : `/administration/dimensions/${dimensionId}/factors`
)

const connecter = connect(
  (state: RootState) => ({
    currentUser: getCurrentUser(state),
    features: getFeatures(state),
  }),
  {
    openModal,
  },
)
type PropsFromRedux = ConnectedProps<typeof connecter>
type Props = PropsFromRedux

const NormTable: React.FC<Props> = ({ openModal, features }) => {
  const isOwned = useIsOwnedPath()
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
          title={I18n.t('shared.id')}
          id="id"
          hideable={false}
          sorter
          sortOrder={getSortOrder('id')}
          render={(norm) => {
            const url = getNormEditorUrl(norm.id, features)

            return isOwned(url) ? <Link to={url}>{norm.id}</Link> : <a href={url}>{norm.id}</a>
          }}
          width={150}
          fixed="left"
        />
        <Resource.Column<Norm>
          id="disabled"
          title={I18n.t('shared.active')}
          render={norm => <ActiveSwitch norm={norm} updateResource={updateResource} />}
          width={100}
          fixed="left"
        />
        <Resource.Column<Norm>
          title={`${I18n.t('shared.name')}`}
          id="name"
          width={300}
          render={item => item?.name}
          sorter
        />
        <Resource.Column<Norm>
          title={I18n.t('shared.dimension')}
          width={300}
          id="dimension.name"
          render={(_, { dimension }) => {
            if (!dimension?.id) return null

            const url = getDimensionFactorsUrl(dimension.id, features)

            return isOwned(url) ? <Link to={url}>{dimension.name}</Link> : <a href={url}>{dimension.name}</a>
          }}
          sorter
        />
        <Resource.Column<Norm>
          title={`${I18n.t('admin.campaigns_users_updated_by')}`}
          id="updated_by.name"
          render={(_, { updatedBy }) => updatedBy?.name}
          width={200}
          sorter
        />
        <Resource.Column<Norm>
          title={I18n.t('shared.owner')}
          id="owner.name"
          width={200}
          sorter
          render={(_, { owner }) => (
            owner?.id ? (
              <Link to={`/admin/clients/${owner.id}/projects`}>
                {owner.name}
              </Link>
            ) : (
              <PlaceholderText>{I18n.t('admin.platform_owner')}</PlaceholderText>
            )
          )}
        />
        <Resource.Column<Norm>
          title={`${I18n.t('shared.created_at')}`}
          id="createdAt"
          width={150}
          sorter
          render={(_, { createdAt }) => createdAt}
        />
        <Resource.Column<Norm>
          title={`${I18n.t('shared.last_updated')}`}
          id="updatedAt"
          sorter
          width={150}
          render={(_, { updatedAt }) => updatedAt}
        />
        <Resource.Column<Norm>
          title={I18n.t('shared.action')}
          id="action"
          hideable={false}
          render={norm => (
            <ConditionalDropdown
              menu={
                    getActionMenuProps({
                      norm,
                      removeResource,
                      openModal,
                      memberAction,
                      features,
                      isOwned,
                    })
                }
            />
          )}
          width={100}
          fixed="right"
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
    features: Record<string, boolean>
    isOwned: (path?: string) => boolean
}

const getActionMenuProps = ({
  norm, removeResource, openModal, memberAction, features, isOwned,
}: ActionMenuData): MenuProps => {
  const {
    id, name, meta: { permissions }, normType,
  } = norm
  const normEditorUrl = getNormEditorUrl(norm.id, features)

  const exportNorm = (normId: string) => memberAction({
    id: normId,
    action: 'export',
    method: 'post',
    responseType: t.literal('ok'),
  }).then(() => {
    message.success(I18n.t('admin.norms_export_success_msg'))
  })

  const menuItems = [
    permissions.edit && { key: 'edit', label: I18n.t('common.actions.edit') },
    permissions.delete && { key: 'remove', label: I18n.t('common.actions.remove') },
    permissions.copy && { key: 'copy', label: I18n.t('common.actions.copy') },
    permissions.export && normType === 'five_scale' && {
      key: 'export_norm', label: I18n.t('admin.norms_sidebar_export'),
    },
    permissions.editor && {
      key: 'norm_editor',
      label: isOwned(normEditorUrl) ? (
        <Link to={normEditorUrl}>{I18n.t('admin.norms_sidebar_editor')}</Link>
      ) : (
        <a href={normEditorUrl}>{I18n.t('admin.norms_sidebar_editor')}</a>
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
