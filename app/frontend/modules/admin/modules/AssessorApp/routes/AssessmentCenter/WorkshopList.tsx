import React from 'react'
import { Radio, Typography } from 'antd'
import { useParams } from 'react-router-dom'
import { DateTimeWithZone } from '~/glint'
import dayjs from '~/utils/dayjs'
import { Workshop, WorkshopTR } from '~/modules/admin/modules/campaigns/core/assessors/workshop'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import styles from './WorkshopList.less'

const { I18n } = window

const Filters = () => {
  const { resource } = useResourceContext()
  const filter = resource.getFilteredValue('date_filter') || 'current'
  const changeFilter = (tab) => {
    resource.changeFilter('date_filter', tab)
  }
  return (
    <div className="mb8">
      <Radio.Group onChange={e => changeFilter(e.target.value)} defaultValue={filter}>
        <Radio.Button value="current">{I18n.t('administration.assessment_center.current')}</Radio.Button>
        <Radio.Button value="upcoming">{I18n.t('administration.assessment_center.upcoming')}</Radio.Button>
        <Radio.Button value="past">{I18n.t('administration.assessment_center.past')}</Radio.Button>
      </Radio.Group>
    </div>
  )
}

export const WorkshopList: React.FC = () => {
  const {
    tab,
  } = useParams<{ tab: string }>()
  const config = {
    trackUrl: true,
    responseType: WorkshopTR,
    initialFilter: { date_filter: tab || 'current' },
    apiConfig: {
      include: ['campaign'],
      fields: {
        workshops: ['start_time', 'duration', 'name', 'campaign'],
        campaign: ['name'],
      },
    },
  }

  return (
    <>
      <title>
        {`${I18n.t('assessments_reports.menu.assessment_center')} - ${I18n.t('frontend.lighthouse_app')}`}
      </title>
      <Resource config={config} name="workshops">
        <Resource.Filter hideSearch placeholder="" name="" />
        <Filters />
        <Resource.Table
          onRowChange={record => ({
            onClick: () => {
              const workshop = record as Workshop
              const { projectId } = workshop?.campaign
              const { id: campaignId } = workshop?.campaign
              const workshopId = record.id
              // eslint-disable-next-line max-len
              const basePath = `/admin/projects/${parseInt(String(projectId), 10)}/new_campaigns/${parseInt(String(campaignId), 10)}`
              const url = `${basePath}/scheduling/assessment_center/${parseInt(String(workshopId), 10)}`
              window.location.href = url
            },
            className: styles.clickableRow,
          })}
          pagination
        >
          <Resource.Column<Workshop>
            title={I18n.t('common.column.id')}
            id="id"
            width="10%"
            render={(_, { id }) => (
              <Typography.Link>
                {id}
              </Typography.Link>
            )}
          />
          <Resource.Column<Workshop>
            title={I18n.t('administration.scheduling.columns.start_time')}
            id="startTime"
            width="15%"
            render={(_, { startTime }) => <DateTimeWithZone dateString={startTime} format="lll" />}
          />
          <Resource.Column<Workshop>
            title={I18n.t('admin.slot_name')}
            id="slot_name"
            width="15%"
            render={(_, { name }) => name}
          />
          <Resource.Column<Workshop>
            title={I18n.t('administration.scheduling.columns.duration')}
            id="duration"
            width="10%"
            render={(_, { duration }) => dayjs.duration(duration, 'seconds').humanize()}
          />
          <Resource.Column<Workshop>
            title={I18n.t('administration.scheduling.columns.campaign_name')}
            id="duration"
            dataIndex="campaign.name"
            render={(_, { campaign }) => campaign.name}
            width="10%"
          />
        </Resource.Table>
      </Resource>
    </>
  )
}
