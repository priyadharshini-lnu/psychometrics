import { FC, useEffect, useState } from 'react'
import {
  useLocation,
  useNavigate, useParams,
} from 'react-router-dom'
import {
  Space, Descriptions, Avatar, Skeleton, Divider,
  Radio, message, Button, Tag, Tooltip, Flex,
} from 'antd'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import type { DescriptionsProps } from 'antd'
import {
  ArrowLeftOutlined, CopyOutlined, InfoCircleOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
import dayjs from '~/utils/dayjs'
import { WorkshopEditFormModal } from './WorkshopEditFormModal'
import settings from '~/modules/admin/modules/campaigns/settings'
import routeUtils from '~/utils/route'
import { secondsToDayHoursAndMinutes } from '~/utils/time'
import { useResources } from '~/hooks/useResources'
import { Workshop, WorkshopTR } from '~/modules/admin/modules/campaigns/core/workshop'
import { ResourceAvatar, DateTimeWithZone } from '~/glint'
import { SubjectList } from './SubjectList'
import { Activities } from './Activities'
import { ResourceList } from './ResourceList'
import { ChangeStatusModal } from './ChangeStatusModal'
import { Recordings } from './Recordings'

import styles from './styles.less'

const { I18n } = window
const STATUS_TAG_COLOR = {
  open: 'success',
  closed: 'error',
}

export const WorkshopPage: FC = () => {
  const {
    id,
    campaignId,
    tab,
  } = useParams() as { id: string, campaignId: string, tab?: string }
  const location = useLocation()
  const [currentTab, setCurrentTab] = useState(tab || 'subjects')
  const [showForm, setShowForm] = useState(false)
  const [openChangeStatusModal, setOpenChangeStatusModal] = useState(false)
  const navigate = useNavigate()
  const prefixPath = `${settings.urlPrefix}/${campaignId}/scheduling`

  const handleTabChange = (currentTab) => {
    routeUtils.moveTo(navigate, prefixPath, `/assessment_center/${id}/${currentTab}`, false, location.state)
    setCurrentTab(currentTab)
  }

  const {
    fetchSingle,
    getResource,
    updateResource,
    memberAction,
  } = useResources<Workshop>(
    'workshops',
    {
      basePath: `campaigns/${campaignId}/`,
      responseType: WorkshopTR,
      apiConfig: {
        include: ['workshop_managers', 'workshop_assessors', 'workshop_resources', 'campaign_assessment_group'],
        include_resource_meta: ['permissions'],
        fields: {
          workshop_managers: ['id', 'user_id', 'full_name', 'photo_url', 'email'],
          workshop_assessors: ['id', 'user_id', 'full_name', 'photo_url', 'email'],
          workshop_resources: ['id', 'name', 'url'],
          campaign_assessment_group: ['id', 'name'],
        },
      },
    },
  )

  useEffect(() => {
    fetchSingle({ id })
  }, [])
  const workshop = getResource(id)

  const cancellationTooltip = (workshop: Workshop) => {
    const date = dayjs(workshop.startTime)
      .subtract(workshop.cancellationLeadTime, 's')
    return (I18n.t('administration.scheduling.info.cancellation_tooltip',
      { date: `${date.format('DD/MM/YYYY hh:mm A')} ${date.format(' (z)')}` }))
  }

  const schedulingTooltip = (workshop: Workshop) => {
    const date = dayjs(workshop.startTime)
      .subtract(workshop.schedulingLeadTime, 's')
    return (I18n.t('administration.scheduling.info.scheduling_tooltip',
      { date: `${date.format('DD/MM/YYYY hh:mm A')} ${date.format(' (z)')}` }))
  }

  if (!workshop) {
    return (
      <Skeleton active />
    )
  }

  const backUrl = location?.state?.search ? `/assessment_center${location.state?.search}` : '/assessment_center'

  const items: DescriptionsProps['items'] = [
    {
      label: I18n.t('administration.scheduling.info.date'),
      children: <DateTimeWithZone dateString={workshop.startTime} />,
      span: {
        sm: 2,
      },
    },
    {
      label: I18n.t('administration.scheduling.info.duration'),
      children: `${secondsToDayHoursAndMinutes(workshop.duration)}`,
    },
    {
      label: I18n.t('common.column.status'),
      children: (
        <>
          <Tag color={STATUS_TAG_COLOR[workshop.status]}>
            {I18n.t(`administration.workshop.statuses.${workshop.status}`)}
          </Tag>
          <Button type="link" onClick={() => setOpenChangeStatusModal(true)} className="p-0">
            {I18n.t('common.actions.change')}
          </Button>
        </>
      ),
    },
    {
      label: I18n.t('administration.scheduling.info.booked'),
      children: `${workshop.bookedSeats}`,
    },
    {
      label: I18n.t('administration.scheduling.info.remaining'),
      children: `${workshop.remainingSeats}`,
    },
    {
      label: I18n.t('administration.scheduling.info.campaign_assessment_group'),
      children: `${workshop.campaignAssessmentGroup?.name}`,
      span: {
        sm: 2,
      },
    },
    {
      label: I18n.t('administration.scheduling.info.link'),
      children: (
        <>
          {workshop.meetingLink ? (
            <Space>
              {/* deepcode ignore DOMXSS: We are using sanitized url from our own backend */}
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
        </>),
    },
    {
      label: I18n.t('administration.scheduling.info.timezone'),
      children: `${workshop.timezone}`,
    },
    {
      label: I18n.t('administration.scheduling.info.managers'),
      children: <ResourcesTag resources={workshop.workshopManagers} />,
    },
    {
      label: I18n.t('administration.scheduling.info.assessors'),
      children: <ResourcesTag resources={workshop.workshopAssessors} />,
    },
    {
      label: I18n.t('administration.scheduling.info.scheduling_lead_time'),
      children: (
        <Flex gap={4}>
          <span>
            {secondsToDayHoursAndMinutes(workshop.schedulingLeadTime)}
          </span>
          <Tooltip
            title={schedulingTooltip(workshop)}
          >
            <InfoCircleOutlined />
          </Tooltip>
        </Flex>
      ),
    },
    {
      label: I18n.t('administration.scheduling.info.cancellation_lead_time'),
      children: (
        <Flex gap={4}>
          <span>
            {secondsToDayHoursAndMinutes(workshop.cancellationLeadTime)}
          </span>
          <Tooltip
            title={cancellationTooltip(workshop)}
          >
            <InfoCircleOutlined />
          </Tooltip>
        </Flex>),
    },
    {
      label: I18n.t('administration.scheduling.info.late_cancellation_and_scheduling'),
      children: (
        <>
          {workshop.allowLateCancellationAndRescheduling ? I18n.t('administration.scheduling.info.allowed')
            : I18n.t('administration.scheduling.info.not_allowed')}
        </>
      ),
      span: {
        xs: 1,
        sm: 2,
        md: 3,
        lg: 3,
      },
    },
  ]

  return (
    <>
      <div className="pt-6 ps-6 pe-6">
        <Descriptions
          title={(
            <Flex gap={8}>
              <ArrowLeftOutlined onClick={() => routeUtils.moveTo(navigate, prefixPath, backUrl)} />
              {workshop.name}
              {workshop.videoRecordingEnabled
                && (
                  <Tag color={STATUS_TAG_COLOR.open}>
                    {I18n.t('administration.scheduling.info.recording_enabled')}
                  </Tag>
                )
              }
            </Flex>
          )}
          bordered
          column={{
            xs: 1,
            sm: 2,
            md: 2,
            lg: 2,
            xl: 3,
            xxl: 3,
          }}
          items={items}
          extra={
            workshop.meta?.permissions?.update && (
              <Button
                onClick={() => setShowForm(true)}
                size="large"
              >
                {I18n.t('common.actions.edit')}
              </Button>
            )
          }
          size="small"
        />
        <Divider />
        <div>
          <div className={styles.controls}>
            <Radio.Group onChange={e => handleTabChange(e.target.value)} defaultValue={currentTab}>
              <Radio.Button value="subjects">{I18n.t('administration.scheduling.tabs.subjects')}</Radio.Button>
              <Radio.Button value="resources">{I18n.t('administration.scheduling.tabs.resources')}</Radio.Button>
              <Radio.Button value="activities">{I18n.t('administration.scheduling.tabs.activities')}</Radio.Button>
              {workshop.meta?.permissions?.viewRecordings && (
                <Radio.Button value="recordings">{I18n.t('administration.scheduling.tabs.recordings')}</Radio.Button>
              )}
            </Radio.Group>
          </div>
          {currentTab === 'subjects' && <SubjectList workshop={workshop} />}
          {currentTab === 'resources' && <ResourceList />}
          {currentTab === 'activities' && <Activities />}
          {currentTab === 'recordings' && <Recordings />}
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
    <Avatar.Group max={{ count: MAX_AVATARS }}>
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
