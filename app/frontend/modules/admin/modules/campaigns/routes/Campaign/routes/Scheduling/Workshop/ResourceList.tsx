import React, { ReactNode } from 'react'
import {
  Button,
  MenuProps,
  Space,
  message,
} from 'antd'
import { ConnectedProps, connect } from 'react-redux'
import { useParams } from 'react-router-dom'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { CopyOutlined, PlusOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { MenuItem } from '~/interfaces/Antd'
import { ConfirmationModal } from '~/glint'

import ConditionalDropdown from '~/components/ConditionalDropdown'
import {
  WorkshopResource, WorkshopResourceTR,
} from '~/modules/admin/modules/campaigns/core/workshopResource'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import { TABLE_SETTINGS_KEYS } from '~/modules/admin/components/Resource/settingsKeys'
import { WorkshopResourceForm } from './WorkshopResources/WorkshopResourceForm'
import Modals from '~/modules/admin/components/Modals'
import { openModal } from '~/modules/admin/core/ui/modals'

const { I18n } = window

const MODALS = {
  WorkshopResourceForm,
  ConfirmationModal,
}

const connector = connect(
  null,
  { openModal },
)

type PropsFromRedux = ConnectedProps<typeof connector>
type Props = PropsFromRedux & { toggle?: ReactNode }

export const ResourceListComponent: React.FC<Props> = ({ openModal, toggle }) => {
  const { id, campaignId } = useParams() as { id: string, campaignId: string }

  const config = {
    responseType: WorkshopResourceTR,
    basePath: `campaigns/${campaignId}/workshops/${id}/`,
    apiConfig: { include_meta: ['permissions'] },
  }
  return (
    <>
      <Resource
        title={I18n.t('admin.scheduling_tabs_assessment_center')}
        config={config}
        name="workshop_resources"
        settingsKey={TABLE_SETTINGS_KEYS.campaignSchedulingAssessmentCenterResources}
      >
        <ResourceFilter openModal={openModal} workshopId={id} toggle={toggle} />
        <Resource.Table embedded pagination>
          <Resource.Column<WorkshopResource>
            title={I18n.t('shared.name')}
            id="name"
            hideable={false}
            width="40%"
          />
          <Resource.Column<WorkshopResource>
            title={I18n.t('admin.scheduling_columns_resource_link')}
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
            title={I18n.t('shared.action')}
            id="actions"
            hideable={false}
            key="actions"
            width={100}
            fixed="right"
            render={workshopResource => (
              <ConditionalDropdown
                menu={
                  getActionsMenuProps({
                    workshopResource,
                    openModal,
                  })
                }
              />
            )}
          />
        </Resource.Table>
        <Modals modals={MODALS} />
      </Resource>
    </>
  )
}

const ResourceFilter = ({
  toggle,
  openModal, workshopId,
}) => {
  const { resource } = useResourceContext<WorkshopResource>()
  const tableLoading = resource.isLoading('fetch')

  return (
    <Resource.Filter
      hideSearch
      name="user_full_name_or_user_email_cont"
      controls={toggle}
    >
      {resource.meta.permissions?.create && (
        <Button
          type="primary"
          disabled={tableLoading}
          onClick={() => openModal('WorkshopResourceForm', { workshopId })}
        >
          <PlusOutlined />
          {I18n.t('admin.scheduling_resources_create')}
        </Button>
      )}
    </Resource.Filter>
  )
}

interface ActionMenuData {
  workshopResource: WorkshopResource
  openModal: (modalName: string, modalProps: unknown) => void
}

const getActionsMenuProps = ({
  workshopResource, openModal,
}: ActionMenuData):MenuProps => {
  const { resource } = useResourceContext<WorkshopResource>()

  const handleOnConfirm = () => resource.removeResource(workshopResource.id).then(() => {
    message.success(
      I18n.t('admin.scheduling_resources_successful_remove', { resource_name: workshopResource?.name }),
    )
  }).catch(() => {
    message.error(I18n.t('common.errors.something_wrong'))
  })

  const menuItems: MenuItem[] = []
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
        {I18n.t('shared.edit')}
      </Button>),
  })
  resource.meta.permissions?.remove && menuItems.push({
    key: 'remove',
    label: (
      <>
        <Button
          type="link"
          onClick={
          () => openModal('ConfirmationModal', {
            title: I18n.t('admin.scheduling_resources_confirm_title'),
            message: I18n.t(
              'admin.scheduling_resources_confirm_message', { resource_name: workshopResource?.name },
            ),
            open: true,
            onConfirm: handleOnConfirm,
          })
        }
          className="ps-0"
        >
          {I18n.t('shared.remove')}
        </Button>
      </>
    ),
  })

  return ({ items: menuItems })
}

export const ResourceList = connector(ResourceListComponent)
