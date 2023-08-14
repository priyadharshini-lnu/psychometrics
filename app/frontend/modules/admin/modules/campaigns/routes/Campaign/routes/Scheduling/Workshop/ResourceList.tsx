import React, { useState } from 'react'
import {
  Button,
  Menu,
  Space,
  message,
} from 'antd'
import { ConnectedProps, connect } from 'react-redux'
import { ItemType } from 'antd/lib/menu/hooks/useItems'
import { CopyOutlined, PlusOutlined } from '@ant-design/icons'
import { useParams } from 'react-router-dom'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { ConfirmationModal } from '~/glint'

import ConditionalDropdown from '~/components/ConditionalDropdown'
import {
  WorkshopResource, WorkshopResourceTR,
} from '~/modules/admin/modules/campaigns/core/workshopResource'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import { WorkshopResourceForm } from './WorkshopResources/WorkshopResourceForm'
import Modals from '~/modules/admin/components/Modals'
import { openModal } from '~/modules/admin/core/ui/modals'

const { I18n } = window

const connector = connect(
  null,
  { openModal },
)

type PropsFromRedux = ConnectedProps<typeof connector>
type Props = PropsFromRedux

export const ResourceListComponent: React.FC<Props> = ({ openModal }) => {
  const { id, campaignId } = useParams<{ id: string, campaignId: string }>()
  const [confirmation, setConfirmation] = useState(false)

  const config = {
    responseType: WorkshopResourceTR,
    basePath: `campaigns/${campaignId}/workshops/${id}/`,
    apiConfig: { include_meta: ['permissions'] },
  }
  return (
    <>
      <Resource config={config} name="workshop_resources">
        <ResourceFilter openModal={openModal} workshopId={id} />
        <Resource.Table pagination>
          <Resource.Column<WorkshopResource>
            title={I18n.t('administration.scheduling.columns.resource_name')}
            id="name"
            width="40%"
          />
          <Resource.Column<WorkshopResource>
            title={I18n.t('administration.scheduling.columns.resource_link')}
            id="url"
            width="40%"
            render={({ url }) => (
              <Space>
                <a href={url} target="_blank" rel="noreferrer">{url}</a>
                <CopyToClipboard
                  text={url}
                  onCopy={() => message.info(I18n.t('common.text.copied'))}
                >
                  <CopyOutlined />
                </CopyToClipboard>
              </Space>
            )}
          />
          <Resource.Column<WorkshopResource>
            title={I18n.t('common.column.action')}
            id="actions"
            key="actions"
            width="2%"
            render={workshopResource => (
              <ConditionalDropdown
                menu={
                  ActionsMenu({
                    workshopResource,
                    setConfirmation,
                    confirmation,
                    openModal,
                  }) as React.ReactElement
                }
              />
            )}
          />
        </Resource.Table>
        <Modals modals={{ WorkshopResourceForm }} />
      </Resource>
    </>
  )
}

const ResourceFilter = ({
  openModal, workshopId,
}) => {
  const { resource } = useResourceContext<WorkshopResource>()
  const tableLoading = resource.isLoading('fetch')

  return (
    <Resource.Filter hideSearch name="user_full_name_or_user_email_cont">
      {resource.meta.permissions?.create && (
        <Button
          type="primary"
          disabled={tableLoading}
          onClick={() => openModal('WorkshopResourceForm', { workshopId })}
        >
          <PlusOutlined />
          {I18n.t('administration.scheduling.resources.create')}
        </Button>
      )}
    </Resource.Filter>
  )
}

interface ActionMenuProps {
  workshopResource: WorkshopResource
  setConfirmation: (confirmation: boolean) => void
  confirmation: boolean
  openModal: (modalName: string, modalProps: unknown) => void
}

const ActionsMenu: React.FC<ActionMenuProps> = ({
  workshopResource, setConfirmation, confirmation, openModal,
}) => {
  const { resource } = useResourceContext<WorkshopResource>()

  const handleOnConfirm = () => resource.removeResource(workshopResource.id).then(() => {
    setConfirmation(false)
    message.success(
      I18n.t('administration.scheduling.resources.successful_remove', { resource_name: workshopResource?.name }),
    )
  }).catch(() => {
    message.error(I18n.t('common.errors.something_wrong'))
  })

  const menuItems: ItemType[] = []
  resource.meta.permissions?.edit && menuItems.push({
    key: 'edit',
    label: (
      <Button
        type="link"
        onClick={
          () => openModal('WorkshopResourceForm', { id: workshopResource.workshopId, workshopResource })
        }
        className="ps-0"
      >
        {I18n.t('common.actions.edit')}
      </Button>),
  })
  resource.meta.permissions?.remove && menuItems.push({
    key: 'remove',
    label: (
      <>
        <Button type="link" onClick={() => setConfirmation(true)} className="ps-0">
          {I18n.t('common.actions.remove')}
        </Button>
        {confirmation && (
          <ConfirmationModal
            title={I18n.t('administration.scheduling.resources.confirm_title')}
            message={
              I18n.t('administration.scheduling.resources.confirm_message', { resource_name: workshopResource?.name })
            }
            onConfirm={handleOnConfirm}
            onCancel={() => setConfirmation(false)}
          />
        )}
      </>
    ),
  })

  return (
    <Menu items={menuItems} />
  )
}

export const ResourceList = connector(ResourceListComponent)
