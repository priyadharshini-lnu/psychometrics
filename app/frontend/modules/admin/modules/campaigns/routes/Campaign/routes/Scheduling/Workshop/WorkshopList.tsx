import React from 'react'
import {
  Row, DatePicker, Avatar, Button, Space,
} from 'antd'
import {
  useLocation, useHistory, Link, useParams,
} from 'react-router-dom'
import { PlusOutlined } from '@ant-design/icons'
import moment, { Moment } from 'moment'
import { Workshop, WorkshopTR } from '~/modules/admin/modules/campaigns/core/workshop'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import { ResourceAvatar } from '~/glint'
import { formatWorkshopDate } from '~/utils/workshop'

const { I18n } = window

export const WorkshopList: React.FC = () => {
  const { campaignId } = useParams<{ campaignId: string }>()
  const history = useHistory()
  const location = useLocation()

  const openForm = () => {
    history.push(`${location.pathname}/new`)
  }

  const config = {
    trackUrl: true,
    responseType: WorkshopTR,
    basePath: `campaigns/${campaignId}/`,
    initialFilter: { start_time_between: CURRENT_WEEK.toString() },
    apiConfig: {
      include: ['workshop_managers', 'workshop_assessors'],
      include_meta: ['permissions'],
      fields: {
        workshop_managers: ['id', 'full_name', 'photo_url', 'email'],
        workshop_assessors: ['id', 'full_name', 'photo_url', 'email'],
      },
    },
  }

  return (
    <>
      <Resource config={config} name="workshops">
        <Resource.Filter hideSearch placeholder="" name="">
          <WorkshopDatePicker />
          <Space>
            <Button type="primary" onClick={openForm}>
              <PlusOutlined />
              {' '}
              {I18n.t('administration.scheduling.add_assessment_center')}
            </Button>
          </Space>
        </Resource.Filter>
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
            render={(_, { id, name }) => <Link to={`assessment_center/${id}`}>{name}</Link>}
            sorter
          />
          <Resource.Column<Workshop>
            title={I18n.t('administration.scheduling.columns.start_time')}
            id="startTime"
            width="15%"
            render={(_, { startTime }) => formatWorkshopDate(startTime)}
            sorter
          />
          <Resource.Column<Workshop>
            title={I18n.t('administration.scheduling.columns.duration')}
            id="duration"
            width="10%"
            render={(_, { duration }) => moment.duration(duration, 'seconds').humanize()}
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
          <Resource.Column<Workshop> title={I18n.t('common.column.action')} id="action" width="3%" />
        </Resource.Table>
      </Resource>
    </>
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

const CURRENT_WEEK: [Moment, Moment] = [
  moment().startOf('w'),
  moment().endOf('w'),
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
  const [initialStartDate, initialEndDate] = getMomentDateRange(
    resource.getFilteredValue('start_time_between'),
  ) || CURRENT_WEEK
  const onDateChange = (dates) => {
    resource.changeFilter('start_time_between', dates.toString())
  }

  return (
    <Row
      justify="space-between"
      align="middle"
      className="pt-4 pb-4 ps-4 pe-4"
    >
      <DatePicker.RangePicker
        clearIcon={false}
        onChange={onDateChange}
        format="DD/MMMM/YYYY"
        defaultValue={[initialStartDate, initialEndDate]}
        ranges={{
          Today: [
            moment(), moment(),
          ],
          'Current Week': [
            moment().startOf('w'), moment().endOf('w'),
          ],
          'Last Week': [
            moment().subtract(1, 'w').startOf('w'), moment().subtract(1, 'w').endOf('w'),
          ],
          'Current Month': [
            moment().startOf('M'), moment().endOf('M'),
          ],
          'Last Month': [
            moment().subtract(1, 'M').startOf('M'), moment().subtract(1, 'M').endOf('M'),
          ],
          'All Time': [
            moment().subtract(100, 'y'), moment().add(100, 'y'),
          ],
          Custom: [
            moment().startOf('M'), moment().endOf('M'),
          ],
        }}
      />
    </Row>
  )
}

const getMomentDateRange = (dateRangeString) => {
  if (typeof (dateRangeString) !== 'string') {
    return undefined
  }
  return dateRangeString.split(',').map(dateString => moment(dateString, 'ddd MMM DD YYYY hh:mm:ss Z'))
}
