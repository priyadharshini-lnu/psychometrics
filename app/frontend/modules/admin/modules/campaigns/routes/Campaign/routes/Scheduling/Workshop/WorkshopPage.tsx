import { FC, useEffect, useState } from 'react'
import {
  useHistory, useParams,
} from 'react-router-dom'
import {
  Space, Descriptions, Avatar, Skeleton, Divider, Radio, message, Button,
} from 'antd'
import {
  ArrowLeftOutlined, CopyOutlined, EditOutlined,
} from '@ant-design/icons'
import moment from 'moment'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { formatWorkshopDate } from '~/utils/workshop'
import { WorkshopEditFormModal } from './WorkshopEditFormModal'
import settings from '~/modules/admin/modules/campaigns/settings'
import routeUtils from '~/utils/route'
import { useResources } from '~/hooks/useResources'
import { Workshop, WorkshopTR } from '~/modules/admin/modules/campaigns/core/workshop'
import { ResourceAvatar } from '~/glint'
import styles from './styles.less'
import { SubjectList } from './SubjectList'
import { Activities } from './Activities'
import { ResourceList } from './ResourceList'

const { I18n } = window

interface Resource {
  id: string
  fullName: string
  photoUrl: string | null
  email: string
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

export const WorkshopPage: FC<{}> = () => {
  const {
    id, campaignId, tab,
  } = useParams<{ id: string, campaignId: string, tab: string | undefined }>()
  const [currentTab, setCurrentTab] = useState(tab || 'subjects')
  const [showForm, setShowForm] = useState(false)
  const history = useHistory()
  const prefixPath = `${settings.urlPrefix}/${campaignId}/scheduling`

  const handleTabChange = (currentTab) => {
    routeUtils.moveTo(history, prefixPath, `/assessment_center/${id}/${currentTab}`)
    setCurrentTab(currentTab)
  }

  const { fetchSingle, getResource, updateResource } = useResources<Workshop>(
    'workshops',
    {
      basePath: `campaigns/${campaignId}/`,
      responseType: WorkshopTR,
      apiConfig: {
        include: ['workshop_managers', 'workshop_assessors'],
        fields: {
          workshop_managers: ['id', 'user_id', 'full_name', 'photo_url', 'email'],
          workshop_assessors: ['id', 'user_id', 'full_name', 'photo_url', 'email'],
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

  return (
    <>
      <div className="pt-6 ps-6 pe-6">
        <Descriptions
          title={(
            <>
              <Space>
                <ArrowLeftOutlined onClick={() => routeUtils.moveTo(history, prefixPath, '/assessment_center')} />
                {workshop.name}
              </Space>
            </>
          )}
          column={{
            lg: 4, md: 3, sm: 2, xs: 1,
          }}
          extra={(
            <Button
              icon={<EditOutlined />}
              onClick={() => setShowForm(true)}
              size="large"
              type="link"
            />
          )}
          contentStyle={{ paddingInlineEnd: '5px' }}
          labelStyle={{ fontWeight: 'bold' }}
          size="small"
        >
          <Descriptions.Item label={I18n.t('administration.scheduling.info.date')}>
            {formatWorkshopDate(workshop.startTime)}
          </Descriptions.Item>
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
            { workshop.meetingLink && (
              <Space>
                <a href={workshop.meetingLink} target="_blank" rel="noreferrer">
                  {I18n.t('administration.scheduling.info.join_meeting')}
                </a>
                <CopyToClipboard
                  text={workshop.meetingLink}
                  onCopy={() => message.info(I18n.t('common.text.copied'))}
                >
                  <CopyOutlined />
                </CopyToClipboard>
              </Space>
            )}
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
        <Divider />
        <div>
          <div className={styles.controls}>
            <Radio.Group onChange={e => handleTabChange(e.target.value)} defaultValue={currentTab}>
              <Radio.Button value="subjects">{I18n.t('administration.scheduling.tabs.subjects')}</Radio.Button>
              <Radio.Button value="resources">{I18n.t('administration.scheduling.tabs.resources')}</Radio.Button>
              <Radio.Button value="activities">{I18n.t('administration.scheduling.tabs.activities')}</Radio.Button>
            </Radio.Group>
          </div>
          {currentTab === 'subjects' && <SubjectList workshop={workshop} />}
          {currentTab === 'resources' && <ResourceList />}
          {currentTab === 'activities' && <Activities />}
        </div>
      </div>
      {showForm && (
        <WorkshopEditFormModal
          close={() => setShowForm(false)}
          workshop={workshop}
          updateWorkshop={updateResource}
        />
      )}
    </>
  )
}
