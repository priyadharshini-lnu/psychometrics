import React from 'react'
import {
  Row, Avatar, Button, Space, Dropdown, message,
} from 'antd'
import {
  useLocation, useNavigate, Link, useParams,
} from 'react-router-dom'
import {
  PlusOutlined,
  MoreOutlined,
} from '@ant-design/icons'
import { connect } from 'react-redux'
import dayjs from '~/utils/dayjs'
import { Workshop, WorkshopTR } from '~/modules/admin/modules/campaigns/core/workshop'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import { ResourceAvatar, DatePickerWithRanges, DateTimeWithZone } from '~/glint'
import { setData } from '~/modules/admin/core/ui/temp'
import { secondsToDayHoursAndMinutes } from '~/utils/time'

const { I18n } = window

export const WorkshopList: React.FC = () => {
  const { campaignId } = useParams() as { campaignId: string }
  const navigate = useNavigate()
  const location = useLocation()

  const openForm = () => {
    navigate(`${location.pathname}/new`)
  }

  const config = {
    trackUrl: true,
    responseType: WorkshopTR,
    basePath: `campaigns/${campaignId}/`,
    initialFilter: { start_time_between: DEFAULT_RANGE.map(date => getDateStringForSearch(date)).toString() },
    apiConfig: {
      include: ['workshop_managers', 'workshop_assessors', 'workshop_resources'],
      include_meta: ['permissions'],
      trackUrl: true,
      fields: {
        workshop_managers: ['id', 'full_name', 'photo_url', 'email'],
        workshop_assessors: ['id', 'full_name', 'photo_url', 'email'],
        workshop_resources: ['name', 'url'],
      },
    },
  }

  return (
    <>
      <Resource config={config} name="workshops">
        <Filter openForm={openForm} />
        <Resource.Table pagination>
          <Resource.Column<Workshop>
            title={I18n.t('common.column.id')}
            id="id"
            width="3%"
            sorter
          />
          <Resource.Column<Workshop>
            title={I18n.t('administration.scheduling.columns.name')}
            id="name"
            width="20%"
            render={(_, { id, name }) => (
              <Link to={`${id}`} state={{ search: location.search }}>
                {name}
              </Link>
            )}
            sorter
          />
          <Resource.Column<Workshop>
            title={I18n.t('administration.scheduling.columns.start_time')}
            id="startTime"
            width="15%"
            render={(_, { startTime }) => <DateTimeWithZone dateString={startTime} />}
            sorter
          />
          <Resource.Column<Workshop>
            title={I18n.t('administration.scheduling.columns.duration')}
            id="duration"
            width="10%"
            render={(_, { duration }) => secondsToDayHoursAndMinutes(duration)}
          />
          <Resource.Column<Workshop>
            title={I18n.t('administration.scheduling.columns.seats')}
            id="duration"
            width="10%"
            render={(_, { totalSeats, bookedSeats }) => `${bookedSeats}/${totalSeats}`}
          />
          <Resource.Column<Workshop>
            title={I18n.t('administration.scheduling.columns.managers')}
            id="workshopManagers"
            render={(_, { workshopManagers }) => (
              <ResourcesTag resources={workshopManagers} />
            )}
          />
          <Resource.Column<Workshop>
            title={I18n.t('administration.scheduling.columns.assessors')}
            id="workshopAssessors"
            render={(_, { workshopAssessors }) => (
              <ResourcesTag resources={workshopAssessors} />
            )}
          />
          <Resource.Column<Workshop>
            title={I18n.t('common.column.action')}
            id="action"
            width="3%"
            render={(_, workshop) => <Menu workshop={workshop} />}
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
    navigate(`${location.pathname}/new`)
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
      message.success(I18n.t('administration.workshop.actions.remove_workshop'))
    }).catch(() => {
      message.error(I18n.t('administration.workshop.errors.remove_workshop_failure'))
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
          {I18n.t('administration.scheduling.add_assessment_center')}
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
    <Row
      justify="space-between"
      align="middle"
      className="pt-4 pb-4 ps-4 pe-4"
    >
      <DatePickerWithRanges
        allowClear={false}
        onChange={onDateChange}
        format="DD/MMM/YYYY"
        defaultValue={[initialStartDate, initialEndDate]}
      />
    </Row>
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
