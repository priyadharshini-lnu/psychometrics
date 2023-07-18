import { FC, useEffect } from 'react'
import {
  useHistory, useLocation, Link, useParams,
} from 'react-router-dom'
import {
  Menu, Space, Descriptions, Avatar, Skeleton,
} from 'antd'
import { ItemType } from 'antd/lib/menu/hooks/useItems'
import { ArrowLeftOutlined, CopyOutlined } from '@ant-design/icons'
import moment from 'moment'
import { useResources } from '~/hooks/useResources'
import { Workshop, WorkshopTR } from '~/modules/admin/modules/campaigns/core/workshop'
import { ResourceAvatar } from '~/glint'
import styles from './styles.less'

const { I18n } = window

interface Resource {
  id: string
  fullName: string
  photoUrl: string | null
}

interface ResourcesProps {
  resources: Resource[]
}
const MAX_AVATARS = 3
const ResourcesTag: React.FC<ResourcesProps> = ({ resources }) => (
  resources && (
    <Avatar.Group maxCount={MAX_AVATARS}>
      {resources.map((resource: Resource) => (
        <ResourceAvatar
          key={resource.id}
          tooltip={resource.fullName}
          url={resource?.photoUrl}
          name={resource.fullName}
        />
      ))}
    </Avatar.Group>
  )
) || null

export const WorkshopPage: FC = () => {
  const { id, projectId, campaignId } = useParams<{ id: string, projectId: string, campaignId: string }>()
  const history = useHistory()
  const { pathname } = useLocation()
  const { fetchSingle, getResource } = useResources<Workshop>(
    'workshops',
    {
      basePath: `campaigns/${campaignId}/`,
      responseType: WorkshopTR,
      apiConfig: {
        include: ['workshop_managers', 'workshop_assessors'],
        fields: {
          workshop_managers: ['id', 'full_name', 'photo_url'],
          workshop_assessors: ['id', 'full_name', 'photo_url'],
        },
      },
    },
  )

  useEffect(() => { fetchSingle({ id }) }, [])
  const workshop = getResource(id)

  if (!workshop) {
    return (
      <Skeleton active />
    )
  }

  const handleOnSelect = ({ key }) => {
    history.push(
      `/administration/projects/${projectId}/new_campaigns/${campaignId}/scheduling/assessment_center/${id}/${key}`,
    )
  }

  const getActiveMenuKey = (pathname: string): Array<string> | undefined => {
    if (pathname.endsWith('/subjects')) {
      return ['subjects']
    }
    if (pathname.endsWith('/assessors')) {
      return ['assessors']
    }
    if (pathname.endsWith('/resources')) {
      return ['resources']
    }
    return undefined
  }

  const menuItems: ItemType[] = [
    { key: 'subjects', label: I18n.t('administration.scheduling.tabs.subjects') },
    { key: 'assessors', label: I18n.t('administration.scheduling.tabs.assessors') },
    { key: 'resources', label: I18n.t('administration.scheduling.tabs.resources') },
  ]

  return (
    <>
      <div className="pt-6 ps-6 pe-6">
        <Descriptions
          title={(
            <>
              <Space>
                <ArrowLeftOutlined onClick={() => history.goBack()} />
                {moment(workshop.startTime).format('Do MMMM YYYY, h:mm a')}
              </Space>
            </>
          )}
          column={4}
          extra={(<></>)}
        >
          <Descriptions.Item label={I18n.t('administration.scheduling.info.duration')}>
            {moment.duration(workshop.duration, 'seconds').humanize()}
          </Descriptions.Item>
          <Descriptions.Item label={I18n.t('administration.scheduling.info.booked')}>
            {workshop.bookedSeats}
          </Descriptions.Item>
          <Descriptions.Item
            label={I18n.t('administration.scheduling.info.managers')}
            className={styles.workshopAvatar}
          >
            <ResourcesTag resources={workshop.workshopManagers} />
          </Descriptions.Item>
          <Descriptions.Item label={I18n.t('administration.scheduling.info.link')}>
            <Space>
              <Link to={{ pathname: workshop.meetingLink }} target="_blank">{workshop.meetingLink}</Link>
              <CopyOutlined />
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label={I18n.t('administration.scheduling.info.timezone')}>
            {workshop.timezone}
          </Descriptions.Item>
          <Descriptions.Item label={I18n.t('administration.scheduling.info.remaining')}>
            {workshop.remainingSeats}
          </Descriptions.Item>
          <Descriptions.Item
            label={I18n.t('administration.scheduling.info.assessors')}
            className={styles.workshopAvatar}
          >
            <ResourcesTag resources={workshop.workshopAssessors} />
          </Descriptions.Item>
        </Descriptions>
      </div>

      <Menu
        items={menuItems}
        onSelect={handleOnSelect}
        selectedKeys={getActiveMenuKey(pathname)}
        mode="horizontal"
      />
    </>
  )
}
