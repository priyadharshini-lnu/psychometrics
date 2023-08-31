import { useState } from 'react'
import {
  Dropdown, Tag, Button, message,
} from 'antd'
import {
  useParams, useLocation, useHistory, Link,
} from 'react-router-dom'
import { WorkshopInvite } from 'modules/admin/modules/campaigns/core/invites'
import {
  PlusOutlined,
  MoreOutlined,
} from '@ant-design/icons'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import { formatWorkshopDate } from '~/utils/workshop'
import { ConfirmationModal } from '~/glint'

const { I18n } = window

export const InvitesTable = () => {
  const params = useParams<{campaignId: string}>()

  const history = useHistory()
  const location = useLocation()

  const openForm = () => {
    history.push(`${location.pathname}/add_invite`)
  }


  const Menu = ({ item }) => {
    const { resource } = useResourceContext<WorkshopInvite, { permissions: { destroy: boolean }}>()
    const [confirmation, setConfirmation] = useState(false)
    const remove = () => {
      resource.removeResource(item.id).then(() => {
        message.success(I18n.t('administration.assessment_center.invite.remove_success'))
      })
    }

    return (
      <>
        <Dropdown
          trigger={['click']}
          menu={{
            onClick () {
              setConfirmation(true)
            },
            items: [
              {
                label: I18n.t('administration.assessment_center.invite.remove'),
                key: 'remove',
              },
            ],
          }}
        >
          <Button type="link">
            <MoreOutlined />
          </Button>
        </Dropdown>
        {confirmation && (
        <ConfirmationModal
          title={I18n.t('administration.assessment_center.invite.confirmation.title')}
          message={
                I18n.t('administration.assessment_center.invite.confirmation.message')
              }
          onConfirm={remove}
          onCancel={() => setConfirmation(false)}
        />
        )}
      </>
    )
  }

  return (
    <div>
      <Resource
        config={{
          basePath: `campaigns/${params.campaignId}`,
          apiConfig: {
            include: ['workshops'],
            fields: { workshops: 'start_time' },
            include_meta: ['permissions'],
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
            title={I18n.t('administration.assessment_center.invite.actions')}
            id="actions"
            render={(item) => {
              const { resource } = useResourceContext<WorkshopInvite, { permissions: { remove : boolean } }>()

              return resource.meta.permissions.remove ? <Menu item={item} /> : null
            }}
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
    <Resource.Filter placeholder="Search" name="translations_title_cont">
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
