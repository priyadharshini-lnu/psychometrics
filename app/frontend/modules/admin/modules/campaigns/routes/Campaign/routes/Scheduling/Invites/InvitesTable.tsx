import React, { ReactNode } from 'react'
import {
  Tag, Button, App, MenuProps, Tooltip, Typography,
} from 'antd'
import type { MessageInstance } from 'antd/es/message/interface'
import type { ModalStaticFunctions } from 'antd/es/modal/confirm'
import {
  useParams, useLocation, useNavigate, Link,
} from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { PlusOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { WorkshopInvite } from '~/modules/admin/modules/campaigns/core/invites'
import { MenuItem } from '~/interfaces/Antd'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import { TABLE_SETTINGS_KEYS } from '~/modules/admin/components/Resource/settingsKeys'
import { formatWorkshopDate } from '~/utils/workshop'
import ConditionalDropdown from '~/components/ConditionalDropdown'
import { openModal } from '~/modules/admin/core/ui/modals'
import { InviteEditFormModal } from './InviteEditFormModal'
import Modals from '~/modules/admin/components/Modals'

const MODALS = {
  InviteEditFormModal,
}

const { I18n } = window

export const InvitesTable: React.FC<{ toggle?: ReactNode }> = ({ toggle }) => {
  const { campaignId } = useParams() as { campaignId: string }
  const dispatch = useDispatch()

  const navigate = useNavigate()
  const location = useLocation()
  const { modal, message } = App.useApp()

  const openForm = () => {
    navigate('add_invite')
  }

  const handleEdit = (workshopInvite: WorkshopInvite) => {
    dispatch(openModal('InviteEditFormModal', {
      workshopInvite,
    }))
  }

  return (
    <div>
      <Resource
        title={I18n.t('admin.scheduling_tabs_invites')}
        config={{
          basePath: `campaigns/${campaignId}`,
          apiConfig: {
            include: ['workshops'],
            fields: { workshops: 'start_time' },
            include_meta: ['permissions'],
            filter: {
              campaign_id_eq: campaignId,
            },
          },
        }}
        name="workshop_invites"
        settingsKey={TABLE_SETTINGS_KEYS.campaignSchedulingInvites}
      >
        <Filter openForm={openForm} toggle={toggle} />
        <Resource.Table pagination>
          <Resource.Column
            title={I18n.t('shared.id')}
            id="id"
            hideable={false}
            sorter
            width={100}
            render={(_, { id }) => <Link to={`${location.pathname}/${id}/subjects`}>{id}</Link>}
            fixed="left"
          />
          <Resource.Column<WorkshopInvite>
            title={I18n.t('admin.invite_title')}
            id="title"
            sorter
            render={(_, { title }) => (
              <Tooltip placement="topLeft" title={title}>
                <Typography.Paragraph ellipsis={
                    { rows: 2 }}
                >
                  {title}
                </Typography.Paragraph>
              </Tooltip>
            )}
            width={250}
            fixed="left"
          />
          <Resource.Column<WorkshopInvite>
            title={I18n.t('shared.name')}
            id="name"
            sorter
            render={(_, { name }) => (
              <Tooltip placement="topLeft" title={name}>
                <Typography.Paragraph ellipsis={
                  { rows: 2 }}
                >
                  {name}
                </Typography.Paragraph>
              </Tooltip>
            )}
            width={250}
          />
          <Resource.Column<WorkshopInvite>
            title={I18n.t('admin.invite_assessment_center')}
            id="assessmentCenter"
            render={data => (
              data.workshops[0] ? (
                <>
                  <Tag>
                    {formatWorkshopDate(data.workshops[0].startTime)}
                  </Tag>
                  {data.workshops.length > 1 && `+${data.workshops.length - 1}`}
                </>
              ) : I18n.t('admin.invite_not_selected')
            )}
          />
          <Resource.Column<WorkshopInvite>
            title={I18n.t('admin.invite_center_group')}
            id="campaignAssessmentGroupName"
            minWidth={300}
          />
          <Resource.Column<WorkshopInvite>
            title={I18n.t('admin.invite_subjects_title')}
            id="subjectsCount"
            minWidth={100}
          />
          <Resource.Column<WorkshopInvite>
            title={I18n.t('shared.action')}
            id="actions"
            hideable={false}
            render={data => (
              <ConditionalDropdown
                menu={
                  getActionsMenuProps({
                    workshopInvite: data, modal, message, handleEdit,
                  })
                }
              />
            )}
            width={100}
            fixed="right"
          />
        </Resource.Table>
        <Modals modals={MODALS} />
      </Resource>
    </div>
  )
}

interface FilterProps {
  openForm: () => void
  toggle?: ReactNode
}

const Filter: React.FC<FilterProps> = ({ openForm, toggle }) => {
  const { resource } = useResourceContext<WorkshopInvite, { permissions: { create: boolean } }>()

  return (
    <Resource.Filter
      placeholder={I18n.t('shared.search')}
      name="filterable_fields"
      controls={toggle}
    >
      {resource.meta.permissions.create && (
        <Button type="primary" onClick={openForm}>
          <PlusOutlined />
          {' '}
          {I18n.t('admin.invite_add_invite')}
        </Button>
      )}
    </Resource.Filter>
  )
}

interface ActionMenuData {
  workshopInvite: WorkshopInvite,
  modal: Omit<ModalStaticFunctions, 'warn'>,
  message: MessageInstance,
  handleEdit: (workshopInvite: WorkshopInvite) => void,
}

const getActionsMenuProps = ({
  workshopInvite, modal, message, handleEdit,
}: ActionMenuData): MenuProps => {
  const { resource } = useResourceContext<WorkshopInvite>()

  const handleOnConfirm = () => resource.removeResource(workshopInvite.id).then(() => {
    message.success(
      workshopInvite.title
        ? I18n.t('admin.invite_success_message_with_title', {
          invite_title: workshopInvite.title,
        })
        : I18n.t('admin.invite_success_message'),
    )
  }).catch(() => {
    message.error(I18n.t('common.errors.something_wrong'))
  })

  const handleRemove = () => {
    modal.confirm({
      title: I18n.t('shared.confirm'),
      content: workshopInvite.title
        ? I18n.t('admin.invite_confirm_message_with_title', {
          invite_title: workshopInvite.title,
        })
        : I18n.t('admin.invite_confirm_message'),
      okText: I18n.t('shared.confirm'),
      cancelText: I18n.t('shared.cancel'),
      onOk: handleOnConfirm,
    })
  }

  const handleEditInvite = () => {
    handleEdit(workshopInvite)
  }

  const menuItems:MenuItem[] = []
  resource.meta.permissions?.update && menuItems.push({
    key: 'edit',
    label: I18n.t('shared.edit'),
    onClick: handleEditInvite,
  })

  resource.meta.permissions?.remove && menuItems.push({
    key: 'remove',
    label: I18n.t('shared.remove'),
    onClick: handleRemove,
  })

  return ({ items: menuItems })
}
