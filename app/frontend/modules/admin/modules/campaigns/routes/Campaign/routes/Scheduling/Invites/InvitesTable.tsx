import {
  Tag, Button, App, MenuProps,
} from 'antd'
import type { MessageInstance } from 'antd/es/message/interface'
import type { ModalStaticFunctions } from 'antd/es/modal/confirm'
import {
  useParams, useLocation, useNavigate, Link,
} from 'react-router-dom'
import { WorkshopInvite } from 'modules/admin/modules/campaigns/core/invites'
import { PlusOutlined } from '@ant-design/icons'
import { MenuItem } from '~/interfaces/Antd'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import { formatWorkshopDate } from '~/utils/workshop'
import ConditionalDropdown from '~/components/ConditionalDropdown'

const { I18n } = window

export const InvitesTable = () => {
  const { campaignId } = useParams() as { campaignId: string }

  const navigate = useNavigate()
  const location = useLocation()
  const { modal, message } = App.useApp()

  const openForm = () => {
    navigate(`${location.pathname}/add_invite`)
  }

  return (
    <div>
      <Resource
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
      >
        <Filter openForm={openForm} />
        <Resource.Table pagination>
          <Resource.Column
            title={I18n.t('administration.assessment_center.invite.id')}
            id="id"
            sorter
            width="10%"
            render={(_, { id }) => <Link to={`${location.pathname}/${id}/subjects`}>{id}</Link>}
          />
          <Resource.Column<WorkshopInvite>
            title={I18n.t('administration.assessment_center.invite.title')}
            id="title"
            sorter
            width="40%"
          />
          <Resource.Column<WorkshopInvite>
            title={I18n.t('administration.assessment_center.invite.assessment_center')}
            id="assessmentCenter"
            width="25%"
            render={data => (
              data.workshops[0] ? (
                <>
                  <Tag>
                    {formatWorkshopDate(data.workshops[0].startTime)}
                  </Tag>
                  {data.workshops.length > 1 && `+${data.workshops.length - 1}`}
                </>
              ) : I18n.t('administration.assessment_center.invite.not_selected')
            )}
          />
          <Resource.Column<WorkshopInvite>
            title={I18n.t('administration.assessment_center.invite.subjects.title')}
            width="15%"
            id="subjectsCount"
          />
          <Resource.Column<WorkshopInvite>
            title={I18n.t('common.column.action')}
            id="actions"
            render={data => (
              <ConditionalDropdown
                menu={
                  getActionsMenuProps({ invite: data, modal, message })
                }
              />
            )}
          />
        </Resource.Table>
      </Resource>
    </div>
  )
}

interface FilterProps {
  openForm: () => void
}

const Filter: React.FC<FilterProps> = ({ openForm }) => {
  const { resource } = useResourceContext<WorkshopInvite, { permissions: { create: boolean } }>()

  return (
    <Resource.Filter placeholder={I18n.t('common.actions.search')} name="title_cont">
      {resource.meta.permissions.create && (
        <Button type="primary" onClick={openForm}>
          <PlusOutlined />
          {' '}
          {I18n.t('administration.assessment_center.invite.add_invite')}
        </Button>
      )}
    </Resource.Filter>
  )
}

interface ActionMenuData {
  invite: WorkshopInvite,
  modal: Omit<ModalStaticFunctions, 'warn'>
  message: MessageInstance
}

const getActionsMenuProps = ({ invite, modal, message }: ActionMenuData): MenuProps => {
  const { resource } = useResourceContext<WorkshopInvite>()

  const handleOnConfirm = () => resource.removeResource(invite.id).then(() => {
    message.success(
      invite.title
        ? I18n.t('administration.assessment_center.invite.success_message_with_title', { invite_title: invite.title })
        : I18n.t('administration.assessment_center.invite.success_message'),
    )
  }).catch(() => {
    message.error(I18n.t('common.errors.something_wrong'))
  })

  const handleRemove = () => {
    modal.confirm({
      title: I18n.t('administration.assessment_center.invite.confirm_title'),
      content: invite.title
        ? I18n.t('administration.assessment_center.invite.confirm_message_with_title', { invite_title: invite.title })
        : I18n.t('administration.assessment_center.invite.confirm_message'),
      okText: I18n.t('common.text.confirm'),
      cancelText: I18n.t('common.text.cancel'),
      onOk: handleOnConfirm,
    })
  }

  const menuItems:MenuItem[] = []

  resource.meta.permissions?.remove && menuItems.push({
    key: 'remove',
    label: (
      <>
        <Button type="link" onClick={handleRemove} className="ps-0">
          {I18n.t('common.actions.remove')}
        </Button>
      </>
    ),
  })

  return ({ items: menuItems })
}
