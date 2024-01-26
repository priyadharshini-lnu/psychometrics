import { FC, useEffect, useState } from 'react'
import {
  useHistory, useParams,
} from 'react-router-dom'
import {
  Space, Descriptions, Avatar, Skeleton, Divider, Radio, message, Button, Tag,
} from 'antd'
import {
  ArrowLeftOutlined, CopyOutlined, EditOutlined,
} from '@ant-design/icons'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { formatWorkshopDate } from '~/utils/workshop'
import { WorkshopEditFormModal } from './WorkshopEditFormModal'
import settings from '~/modules/admin/modules/campaigns/settings'
import routeUtils from '~/utils/route'
import { secondsToDayHoursAndMinutes } from '~/utils/time'
import { useResources } from '~/hooks/useResources'
import { Workshop, WorkshopTR } from '~/modules/admin/modules/campaigns/core/workshop'
import { ResourceAvatar } from '~/glint'
import styles from './styles.less'
import { SubjectList } from './SubjectList'
import { Activities } from './Activities'
import { ResourceList } from './ResourceList'
import { ChangeStatusModal } from './ChangeStatusModal'

const { I18n } = window
const STATUS_TAG_COLOR = {
  open: 'success',
  closed: 'error',
}
interface LocationState {
  state?: {
    search?: string
  }
}

export const WorkshopPage: FC<{location: LocationState}> = ({ location }) => {
  const {
    id, campaignId, tab,
  } = useParams<{ id: string, campaignId: string, tab: string | undefined }>()
  const [currentTab, setCurrentTab] = useState(tab || 'subjects')
  const [showForm, setShowForm] = useState(false)
  const [openChangeStatusModal, setOpenChangeStatusModal] = useState(false)
  const history = useHistory()
  const prefixPath = `${settings.urlPrefix}/${campaignId}/scheduling`

  const handleTabChange = (currentTab) => {
    routeUtils.moveTo(history, prefixPath, `/assessment_center/${id}/${currentTab}`, false, location.state)
    setCurrentTab(currentTab)
  }

  const {
    fetchSingle, getResource, updateResource, memberAction,
  } = useResources<Workshop>(
    'workshops',
    {
      basePath: `campaigns/${campaignId}/`,
      responseType: WorkshopTR,
      apiConfig: {
        include: ['workshop_managers', 'workshop_assessors', 'workshop_resources'],
        include_resource_meta: ['permissions'],
        fields: {
          workshop_managers: ['id', 'user_id', 'full_name', 'photo_url', 'email'],
          workshop_assessors: ['id', 'user_id', 'full_name', 'photo_url', 'email'],
          workshop_resources: ['id', 'name', 'url'],
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

  const backUrl = location?.state?.search ? `/assessment_center${location.state?.search}` : '/assessment_center'

  return (
    <>
      <div className="pt-6 ps-6 pe-6">
        <Descriptions
          title={(
            <>
              <Space>
                <ArrowLeftOutlined onClick={() => routeUtils.moveTo(history, prefixPath, backUrl)} />
                {workshop.name}
              </Space>
            </>
          )}
          column={{
            xxl: 5, xl: 4, lg: 3, md: 2, sm: 1,
          }}
          extra={
            workshop.meta?.permissions?.update && (
            <Button
              icon={<EditOutlined />}
              onClick={() => setShowForm(true)}
              size="large"
              type="link"
            />
            )
          }
          contentStyle={{ paddingInlineEnd: '5px' }}
          labelStyle={{ fontWeight: 'bold' }}
          size="small"
        >
          <Descriptions.Item label={I18n.t('administration.scheduling.info.date')}>
            {formatWorkshopDate(workshop.startTime)}
          </Descriptions.Item>
          <Descriptions.Item label={I18n.t('administration.scheduling.info.duration')}>
            {secondsToDayHoursAndMinutes(workshop.duration)}
          </Descriptions.Item>
          <Descriptions.Item label={I18n.t('administration.scheduling.info.booked')}>
            {workshop.bookedSeats}
          </Descriptions.Item>
          <Descriptions.Item label={I18n.t('common.column.status')} labelStyle={{ alignItems: 'center' }}>
            <Tag color={STATUS_TAG_COLOR[workshop.status]}>
              {I18n.t(`administration.workshop.statuses.${workshop.status}`)}
            </Tag>
            <Button type="link" onClick={() => setOpenChangeStatusModal(true)} className="p-0">
              {I18n.t('common.actions.change')}
            </Button>
          </Descriptions.Item>
          <Descriptions.Item
            label={I18n.t('administration.scheduling.info.managers')}
            className={styles.workshopAvatar}
          >
            <ResourcesTag resources={workshop.workshopManagers} />
          </Descriptions.Item>
          <Descriptions.Item
            label={I18n.t('administration.scheduling.info.reschedule_lead_time')}
          >
            {secondsToDayHoursAndMinutes(workshop.rescheduleLeadTime)}
          </Descriptions.Item>
          <Descriptions.Item label={I18n.t('administration.scheduling.info.link')}>
            { workshop.meetingLink ? (
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
            ) : I18n.t('administration.scheduling.info.none')}
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
          <Descriptions.Item
            label={I18n.t('administration.scheduling.info.cancellation_lead_time')}
          >
            {secondsToDayHoursAndMinutes(workshop.cancellationLeadTime)}
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
      {openChangeStatusModal
        && (
        <ChangeStatusModal
          close={() => setOpenChangeStatusModal(false)}
          memberAction={memberAction}
          workshop={workshop}
        />
        )}
    </>
  )
}

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
