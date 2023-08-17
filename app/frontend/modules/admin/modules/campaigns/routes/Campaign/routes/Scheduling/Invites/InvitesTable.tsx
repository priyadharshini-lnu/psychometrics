import {
  Dropdown, Tag, Button,
} from 'antd'
import moment from 'moment'
import {
  useParams, useLocation, useHistory, Link,
} from 'react-router-dom'
import { WorkshopInvite } from 'modules/admin/modules/campaigns/core/invites'
import {
  PlusOutlined,
  MoreOutlined,
} from '@ant-design/icons'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'

const { I18n } = window

export const InvitesTable = () => {
  const params = useParams<{campaignId: string}>()

  const history = useHistory()
  const location = useLocation()

  const openForm = () => {
    history.push(`${location.pathname}/add_invite`)
  }


  const Menu = ({ item }) => {
    const { resource } = useResourceContext<WorkshopInvite>()
    const remove = () => {
      resource.removeResource(item.id)
    }

    return (
      <Dropdown
        trigger={['click']}
        menu={{
          onClick () {
            remove()
          },
          items: [
            {
              label: I18n.t('workshop_invite.remove'),
              key: 'remove',
            },
          ],
        }}
      >
        <Button type="link">
          <MoreOutlined />
        </Button>
      </Dropdown>
    )
  }

  return (
    <div>
      <Resource
        config={{
          apiConfig: {
            filter: { workshops_campaign_id_eq: params.campaignId },
          },
        }}
        name="workshop_invites"
      >
        <Resource.Filter placeholder="Search" name="title_cont">
          <Button type="primary" onClick={openForm}>
            <PlusOutlined />
            {' '}
            {I18n.t('workshop_invite.add_invite')}
          </Button>
        </Resource.Filter>
        <Resource.Table pagination>
          <Resource.Column
            title={I18n.t('workshop_invite.id')}
            id="id"
            sorter
            render={(_, { id }) => <Link to={`${location.pathname}/${id}/subjects`}>{id}</Link>}
          />
          <Resource.Column<WorkshopInvite> title={I18n.t('workshop_invite.title')} id="title" sorter />
          <Resource.Column<WorkshopInvite>
            title={I18n.t('workshop_invite.assessment_center')}
            id="assessmentCenter"
            render={data => <Tag>{moment(data.startTime).format('Do MMMM YYYY, h:mm a')}</Tag>}
          />
          <Resource.Column<WorkshopInvite>
            title={I18n.t('workshop_invite.subjects')}
            id="subjectsCount"
          />
          <Resource.Column<WorkshopInvite>
            title={I18n.t('workshop_invite.actions')}
            id="actions"
            render={item => (
              <Menu item={item} />
            )}
          />
        </Resource.Table>
      </Resource>
    </div>
  )
}
