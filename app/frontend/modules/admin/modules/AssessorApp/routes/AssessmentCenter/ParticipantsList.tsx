import React, { useEffect, useState } from 'react'
import {
  Col, Radio, Row, Space, Switch, Table, Tag,
  Typography, message,
} from 'antd'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { useNavigate } from 'react-router-dom'
import { CopyOutlined, PlusOutlined, MinusOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import dayjs from '~/utils/dayjs'
import { DateTimeWithZone, ResourceAvatar } from '~/glint'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import { TABLE_SETTINGS_KEYS } from '~/modules/admin/components/Resource/settingsKeys'
import styles from './styles.less'
import {
  ParticipantSubjectTR,
  ParticipantSubject, WorkshopActivity, MetadataForFiltersTR,
} from '~/modules/admin/modules/campaigns/core/assessors/workshopSubjects'
import { secondsToDayHoursAndMinutes } from '~/utils/time'

const { I18n } = window

type ResourcesTagProps = {
  resource: Pick<ParticipantSubject, 'id' | 'fullName' | 'photoUrl'>
}

const ResourcesTag: React.FC<ResourcesTagProps> = ({ resource }) => (
  <ResourceAvatar
    key={resource?.id}
    tooltip={resource?.fullName || ''}
    url={resource?.photoUrl}
    name={resource?.fullName || ''}
  />
)

const ATTENDANCE_TAG_COLORS = {
  no_status: 'default',
  on_time: 'success',
  late: 'warning',
  no_show: 'error',
  dropped_out: 'warning',
}

const SCHEDULING_STATUS_TO_TAG_COLOR = {
  scheduled: 'success',
  rescheduled: 'error',
  cancelled: 'error',
  late_scheduled: 'error',
  late_rescheduled: 'error',
}

const COMPLETED_STATUS = {
  not_started: 'gray',
  completed: 'green',
  late: 'orange',
  dropped_out: 'orange',
  no_show: 'red',
}

type ActivityCellProps = {
  label: string
  children: React.ReactNode
}

const ActivityCell: React.FC<ActivityCellProps> = ({ label, children }) => (
  <div>
    <Typography.Text className={styles.activityLabel}>{label}</Typography.Text>
    <div>{children}</div>
  </div>
)

const ActiveSwitch: React.FC<{ subject: ParticipantSubject }> = ({ subject }) => {
  const { resource } = useResourceContext<ParticipantSubject>()

  return (
    <Switch
      disabled={!resource.meta.permissions?.manage}
      checked={subject.attended}
      onChange={() => {
        resource.updateResource({ id: subject.id, attended: !subject.attended })
      }}
    />
  )
}

const ActivitiesExpandedRow: React.FC<{ subject: ParticipantSubject }> = ({ subject }) => {
  const activities = Array.isArray(subject.workshopActivities) ? subject.workshopActivities : []

  const columns = [
    {
      key: 'prework',
      width: '10%',
      render: () => (
        <ActivityCell label={I18n.t('admin.prework')}>
          {subject.preworks || '-'}
        </ActivityCell>
      ),
    },
    {
      key: 'name',
      width: '20%',
      render: (activity: WorkshopActivity) => (
        <ActivityCell label={I18n.t('admin.activity')}>
          {activity.name || '-'}
        </ActivityCell>
      ),
    },
    {
      key: 'evaluator',
      width: '15%',
      render: (activity: WorkshopActivity) => (
        <ActivityCell label={I18n.t('admin.assessor')}>
          {activity.evaluator ? (
            <Row gutter={[8, 0]} align="middle">
              <Col>
                <ResourceAvatar
                  url={null}
                  name={activity.evaluator.fullName}
                  tooltip={activity.evaluator.fullName}
                />
              </Col>
              <Col>{activity.evaluator.fullName}</Col>
            </Row>
          ) : '-'}
        </ActivityCell>
      ),
    },
    {
      key: 'dateTime',
      width: '15%',
      render: () => (
        <ActivityCell label={I18n.t('admin.date_and_time')}>
          {subject.workshopStartTime
            ? <DateTimeWithZone dateString={subject.workshopStartTime} format="lll" />
            : '-'}
        </ActivityCell>
      ),
    },
    {
      key: 'scheduleTime',
      width: '15%',
      render: (activity: WorkshopActivity) => (
        <ActivityCell label={I18n.t('admin.schedule_time')}>
          {activity.scheduleTime ? dayjs(activity.scheduleTime).format('HH:mm') : '-'}
        </ActivityCell>
      ),
    },
    {
      key: 'status',
      width: '10%',
      render: (activity: WorkshopActivity) => (
        <ActivityCell label={I18n.t('shared.status')}>
          <Tag key={activity.status} color={COMPLETED_STATUS[activity.status || 'not_started']}>
            {I18n.t(`admin.scheduling_status_${activity.status}`)}
          </Tag>
        </ActivityCell>
      ),
    },
    {
      key: 'linkedSubjectMeetingLink',
      width: '15%',
      render: (activity: WorkshopActivity) => (
        <ActivityCell label={I18n.t('admin.meeting_link')}>
          {activity.linkedSubjectMeetingLink ? (
            <Space>
              <a href={activity.linkedSubjectMeetingLink} target="_blank" rel="noreferrer">
                {I18n.t('admin.scheduling_info_join_meeting')}
              </a>
              <CopyToClipboard
                text={activity.linkedSubjectMeetingLink}
                onCopy={() => message.info(I18n.t('common.text.copied'))}
              >
                <CopyOutlined />
              </CopyToClipboard>
            </Space>
          ) : '-'}
        </ActivityCell>
      ),
    },
  ]

  return (
    <div className={styles.activitiesTable}>
      <Table
        dataSource={activities}
        columns={columns}
        pagination={false}
        rowKey={(_, index) => String(index)}
        showHeader={false}
      />
    </div>
  )
}

type FilterOption = { id: string | number, name: string }
type StatusFilterOption = { value: string, label: string }
type FilterOptions = {
  campaigns: FilterOption[]
  slotNames: FilterOption[]
  attendanceStatuses: StatusFilterOption[]
  schedulingStatuses: StatusFilterOption[]
}

const DateFilters = () => {
  const { resource } = useResourceContext()
  const filter = resource.getFilteredValue('date_filter') || 'current'

  return (
    <Radio.Group
      onChange={e => resource.changeFilter('date_filter', e.target.value)}
      value={filter}
    >
      <Radio.Button value="current">{I18n.t('admin.current')}</Radio.Button>
      <Radio.Button value="upcoming">{I18n.t('admin.upcoming')}</Radio.Button>
      <Radio.Button value="past">{I18n.t('admin.past')}</Radio.Button>
    </Radio.Group>
  )
}

const ParticipantsTable: React.FC = () => {
  const { resource } = useResourceContext<ParticipantSubject>()
  const [filterOptions, setFilterOptions] = useState<FilterOptions>()
  const navigate = useNavigate()

  const campaignFilter = resource.getFilteredValue('campaign_id_in')
  const workshopFilter = resource.getFilteredValue('workshop_id_in')

  useEffect(() => {
    const metadataFilters: Record<string, string | string[]> = {}

    if (campaignFilter) {
      metadataFilters.campaign_id_in = campaignFilter
    }

    if (workshopFilter) {
      metadataFilters.workshop_id_in = workshopFilter
    }

    resource.collectionAction({
      action: 'metadata_for_filters',
      method: 'get',
      responseType: MetadataForFiltersTR,
      apiConfig: {
        filter: metadataFilters,
      },
    }).then(data => setFilterOptions(data as FilterOptions))
  }, [campaignFilter, workshopFilter])

  const getFilteredValue = (name: string): string[] | null => {
    const val = resource.getFilteredValue(name)
    if (!val) return null
    return Array.isArray(val) ? val : [val]
  }

  return (
    <Resource.Table
      onRowChange={record => ({
        onClick: () => {
          const workshop = record as ParticipantSubject
          const campaign = workshop?.campaign
          if (!campaign) return
          const basePath = `/admin/projects/${campaign.projectId}/new_campaigns/${campaign.id}`
          navigate(`${basePath}/scheduling/assessment_center/${record.workshopId}`)
        },
        className: styles.clickableRow,
      })}
      pagination
      expandable={{
        expandedRowRender: subject => <ActivitiesExpandedRow subject={subject} />,
        expandIcon: ({ expanded, onExpand, record }) => (
          <span
            className={styles.expandIconWrapper}
            onClick={(e) => {
              e.stopPropagation()
              onExpand(record, e)
            }}
          >
            {expanded ? <MinusOutlined /> : <PlusOutlined />}
          </span>
        ),
      }}
    >
      <Resource.Column<ParticipantSubject>
        title={I18n.t('admin.participants')}
        id="participants"
        hideable={false}
        width={200}
        render={(_, subject) => (
          <Row gutter={[10, 0]}>
            <Col className={styles.workshopSubjectAvatar}>
              <ResourcesTag resource={subject} />
            </Col>
            <Col>
              <Row>
                <Col>{subject?.fullName}</Col>
              </Row>
              <Row>
                <Col className={styles.workshopSubjectEmail}>{subject?.email}</Col>
              </Row>
            </Col>
          </Row>
        )}
        fixed="left"
      />
      <Resource.Column<ParticipantSubject>
        title={I18n.t('admin.scheduling_columns_campaign_name')}
        id="campaign_id"
        width={200}
        filters={filterOptions?.campaigns?.map(c => ({ text: c.name, value: String(c.id) }))}
        filteredValue={getFilteredValue('campaign_id_in')}
        filterSearch
        render={(_, { campaign }) => campaign.name}
        fixed="left"
      />
      <Resource.Column<ParticipantSubject>
        title={I18n.t('admin.slot_name')}
        id="workshop_id"
        width={100}
        filters={filterOptions?.slotNames?.map(s => ({ text: s.name, value: String(s.id) }))}
        filteredValue={getFilteredValue('workshop_id_in')}
        filterSearch
        render={(_, { workshopName }) => workshopName}
      />
      <Resource.Column<ParticipantSubject>
        title={I18n.t('admin.attendance')}
        id="attended"
        render={subject => <ActiveSwitch subject={subject} />}
        width={100}
      />
      <Resource.Column<ParticipantSubject>
        title={I18n.t('admin.attendance_status')}
        id="attendance_status"
        width={100}
        filters={filterOptions?.attendanceStatuses?.map(s => ({ text: s.label, value: s.value }))}
        filteredValue={getFilteredValue('attendance_status_in')}
        render={(_, { attendanceStatus }) => (
          <Tag color={ATTENDANCE_TAG_COLORS[attendanceStatus]}>
            {I18n.t(`admin.scheduling_attendance_status_${attendanceStatus}`)}
          </Tag>
        )}
      />
      <Resource.Column<ParticipantSubject>
        title={I18n.t('admin.scheduling_status')}
        id="scheduling_status"
        width={100}
        filters={filterOptions?.schedulingStatuses?.map(s => ({ text: s.label, value: s.value }))}
        filteredValue={getFilteredValue('scheduling_status_in')}
        render={(_, { schedulingStatus }) => (
          <Tag color={SCHEDULING_STATUS_TO_TAG_COLOR[schedulingStatus]}>
            {I18n.t(`admin.scheduling_scheduling_statuses_${schedulingStatus}`)}
          </Tag>
        )}
      />
      <Resource.Column<ParticipantSubject>
        title={I18n.t('admin.duration')}
        id="duration"
        width={100}
        render={(_, { duration }) => secondsToDayHoursAndMinutes(duration)}
        fixed="right"
      />
    </Resource.Table>
  )
}

export const ParticipantsList: React.FC = () => {
  const config = {
    trackUrl: true,
    responseType: ParticipantSubjectTR,
    initialFilter: { date_filter: 'current' },
    apiConfig: {
      include: ['campaign'],
      fields: {
        workshop_subjects: [
          'full_name', 'email', 'photo_url', 'workshop_id', 'workshop_name', 'campaign',
          'workshop_start_time', 'scheduling_status', 'meeting_link',
          'attendance_status', 'preworks', 'workshop_activities', 'duration', 'attended',
        ],
        workshop_activities: ['name', 'status', 'schedule_time', 'evaluator', 'linked_subject_meeting_link'],
        campaign: ['name'],
      },
    },
  }

  return (
    <Resource
      title={I18n.t('admin.participants_tab')}
      config={config}
      name="workshop_subjects"
      settingsKey={TABLE_SETTINGS_KEYS.assessorParticipants}
    >
      <Resource.Filter
        hideSearch={false}
        placeholder={I18n.t('admin.search_participants')}
        name="user_full_name_or_user_email_cont"
        controls={<DateFilters />}
      />
      <ParticipantsTable />
    </Resource>
  )
}
