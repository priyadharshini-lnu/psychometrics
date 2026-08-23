import React from 'react'
import {
  Avatar, Button, Space, Dropdown, message,
} from 'antd'
import {
  useLocation, useNavigate, Link, useParams,
} from 'react-router-dom'
import { connect } from 'react-redux'
import {
  PlusOutlined,
  MoreOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
import dayjs from '~/utils/dayjs'
import { Workshop, WorkshopTR } from '~/modules/admin/modules/campaigns/core/workshop'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import { TABLE_SETTINGS_KEYS } from '~/modules/admin/components/Resource/settingsKeys'
import { ResourceAvatar, DatePickerWithRanges, DateTimeWithZone } from '~/glint'
import { setData } from '~/modules/admin/core/ui/temp'
import { secondsToDayHoursAndMinutes } from '~/utils/time'
import { baseErrorMessage } from '~/hooks/useResources/utils'

const { I18n } = window

export const WorkshopList: React.FC = () => {
  const { campaignId } = useParams() as { campaignId: string }
  const navigate = useNavigate()
  const location = useLocation()

  const openForm = () => {
    navigate('new')
  }

  const config = {
    trackUrl: true,
    responseType: WorkshopTR,
    basePath: `campaigns/${campaignId}/`,
    initialFilter: { start_time_between: DEFAULT_RANGE.map(date => getDateStringForSearch(date)).toString() },
    apiConfig: {
      include: ['workshop_managers', 'workshop_assessors', 'workshop_resources', 'campaign_assessment_group'],
      include_meta: ['permissions'],
      trackUrl: true,
      fields: {
        workshop_managers: ['id', 'full_name', 'photo_url', 'email'],
        workshop_assessors: ['id', 'full_name', 'photo_url', 'email'],
        workshop_resources: ['name', 'url'],
        campaign_assessment_group: ['id', 'name'],
      },
    },
  }

  return (
    <>
      <Resource
        title={I18n.t('admin.scheduling_tabs_assessment_center')}
        config={config}
        name="workshops"
        settingsKey={TABLE_SETTINGS_KEYS.campaignSchedulingAssessmentCenters}
      >
        <Filter openForm={openForm} />
        <Resource.Table pagination>
          <Resource.Column<Workshop>
            title={I18n.t('shared.id')}
            id="id"
            sorter
            minWidth={100}
            fixed="left"
          />
          <Resource.Column<Workshop>
            title={I18n.t('shared.name')}
            id="name"
            hideable={false}
            minWidth={150}
            render={(_, { id, name }) => (
              <Link to={`${id}`} state={{ search: location.search }}>
                {name}
              </Link>
            )}
            sorter
            fixed="left"
          />
          <Resource.Column<Workshop>
            title={I18n.t('admin.scheduling_columns_start_time')}
            id="startTime"
            minWidth={150}
            render={(_, { startTime }) => <DateTimeWithZone dateString={startTime} />}
            sorter
          />
          <Resource.Column<Workshop>
            title={I18n.t('admin.scheduling_columns_campaign_assessment_group')}
            id="campaignAssessmentGroup.name"
            width={300}
            render={(_, { campaignAssessmentGroup }) => (campaignAssessmentGroup ? campaignAssessmentGroup.name : '-')
            }
          />
          <Resource.Column<Workshop>
            title={I18n.t('admin.scheduling_columns_duration')}
            id="duration"
            width={100}
            render={(_, { duration }) => secondsToDayHoursAndMinutes(duration)}
          />
          <Resource.Column<Workshop>
            title={I18n.t('admin.scheduling_columns_seats')}
            id="duration"
            minWidth={100}
            render={(_, { totalSeats, bookedSeats }) => `${bookedSeats}/${totalSeats}`}
          />
          <Resource.Column<Workshop>
            title={I18n.t('admin.scheduling_columns_managers')}
            id="workshopManagers"
            render={(_, { workshopManagers }) => (
              <ResourcesTag resources={workshopManagers} />
            )}
            minWidth={150}
          />
          <Resource.Column<Workshop>
            title={I18n.t('admin.scheduling_columns_assessors')}
            id="workshopAssessors"
            render={(_, { workshopAssessors }) => (
              <ResourcesTag resources={workshopAssessors} />
            )}
            minWidth={150}
          />
          <Resource.Column<Workshop>
            title={I18n.t('shared.action')}
            id="action"
            hideable={false}
            width={100}
            render={(_, workshop) => <Menu workshop={workshop} />}
            fixed="right"
          />
        </Resource.Table>
      </Resource>
    </>
  )
}

const MenuComponent = ({ workshop, setData }) => {
  const navigate = useNavigate()
  const copy = () => {
    setData(workshop)
    navigate('new')
  }
  const { resource } = useResourceContext<Workshop>()

  const removeWorkshop = () => {
    resource.memberAction({
      id: workshop.id,
      action: 'remove_workshop',
      method: 'delete',
      responseType: WorkshopTR,
    }).then(() => {
      resource.fetch()
      message.success(I18n.t('admin.workshop_actions_remove_workshop'))
    }).catch((error) => {
      message.error(baseErrorMessage(error))
    })
  }

  const handleMenuClick = ({ key }) => {
    if (key === 'copy') {
      return copy()
    }
    if (key === 'remove') {
      return removeWorkshop()
    }
  }

  return (
    <>
      <Dropdown
        trigger={['click']}
        menu={{
          onClick: handleMenuClick,
          items: [
            {
              label: I18n.t('common.actions.copy'),
              key: 'copy',
            },
            resource.meta.permissions?.create ? {
              label: I18n.t('common.actions.remove'),
              key: 'remove',
            } : null,
          ],
        }}
      >
        <Button type="link">
          <MoreOutlined />
        </Button>
      </Dropdown>
    </>
  )
}

const Menu = connect(() => {}, { setData })(MenuComponent)


interface FilterProps {
  openForm: () => void
}

const Filter: React.FC<FilterProps> = ({ openForm }) => {
  const { resource } = useResourceContext<Workshop, { permissions: { create: boolean } }>()

  return (
    <Resource.Filter hideSearch placeholder="" name="">
      <WorkshopDatePicker />
      <Space>
        {resource.meta.permissions.create && (
          <Button type="primary" onClick={openForm}>
            <PlusOutlined />
            {' '}
            {I18n.t('admin.scheduling_add_assessment_center')}
          </Button>
        )}
      </Space>
    </Resource.Filter>
  )
}
interface Resource {
  id: string
  fullName: string
  photoUrl: string | null
}

interface ResourcesProps {
  resources: Resource[]
}

const DEFAULT_RANGE: [dayjs.Dayjs, dayjs.Dayjs] = [
  dayjs().subtract(10, 'd'),
  dayjs().add(10, 'd'),
]

const MAX_AVATARS = 3
const ResourcesTag: React.FC<ResourcesProps> = ({ resources }) => (
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

const WorkshopDatePicker = () => {
  const { resource } = useResourceContext()
  const [initialStartDate, initialEndDate] = getDateRange(
    resource.getFilteredValue('start_time_between'),
  ) || DEFAULT_RANGE
  const onDateChange = (dates) => {
    const newDates = [dates[0].clone().startOf('day'), dates[1].clone().endOf('day')]
    resource.changeFilter('start_time_between',
      newDates.map(date => getDateStringForSearch(date)).toString())
  }

  return (
    <DatePickerWithRanges
      allowClear={false}
      onChange={onDateChange}
      format="DD/MMM/YYYY"
      defaultValue={[initialStartDate, initialEndDate]}
    />
  )
}

const getDateRange = (dateRangeString) => {
  const dateStrings = dateRangeString.split(',')
  return dateStrings
    .map(dateString => dayjs(dateString.trim()))
    .filter(date => date.isValid())
}

const getDateStringForSearch = (date: dayjs.Dayjs) => {
  const formattedDate = date.clone().format('ddd MMM D YYYY HH:mm:ss')
  const timeOffset = date.clone().format('ZZ')

  return `${formattedDate} GMT${timeOffset}`
}
