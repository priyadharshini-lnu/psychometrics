import React from 'react'
import { Radio, Typography } from 'antd'
import { useNavigate } from 'react-router-dom'
import { DateTimeWithZone } from '~/glint'
import { Workshop, WorkshopTR } from '~/modules/admin/modules/campaigns/core/assessors/workshop'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import { TABLE_SETTINGS_KEYS } from '~/modules/admin/components/Resource/settingsKeys'
import styles from './styles.less'
import { secondsToDayHoursAndMinutes } from '~/utils/time'

const { I18n } = window


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

export const CampaignsList: React.FC = () => {
  const navigate = useNavigate()
  const config = {
    trackUrl: true,
    responseType: WorkshopTR,
    initialFilter: { date_filter: 'current' },
    apiConfig: {
      include: ['campaign', 'workshop_subjects'],
      fields: {
        workshops: ['start_time', 'duration', 'name', 'campaign'],
        campaign: ['name'],
        workshop_subjects: ['id', 'full_name', 'photo_url', 'email'],
      },
    },
  }

  return (
    <Resource
      title={I18n.t('admin.campaigns_tab')}
      config={config}
      name="workshops"
      settingsKey={TABLE_SETTINGS_KEYS.assessorCampaigns}
    >
      <Resource.Filter
        hideSearch
        placeholder=""
        name=""
        controls={<DateFilters />}
      />
      <Resource.Table
        onRowChange={record => ({
          onClick: () => {
            const workshop = record as Workshop
            const campaign = workshop?.campaign
            if (!campaign) return
            const basePath = `/admin/projects/${campaign.projectId}/new_campaigns/${campaign.id}`
            navigate(`${basePath}/scheduling/assessment_center/${record.id}`)
          },
          className: styles.clickableRow,
        })}
        pagination
      >
        <Resource.Column<Workshop>
          title={I18n.t('common.column.id')}
          id="id"
          hideable={false}
          width="10%"
          render={(_, { id }) => (
            <Typography.Link>
              {id}
            </Typography.Link>
          )}
          fixed="left"
        />
        <Resource.Column<Workshop>
          title={I18n.t('admin.scheduling_columns_start_time')}
          id="startTime"
          width="15%"
          render={(_, { startTime }) => <DateTimeWithZone dateString={startTime} format="lll" />}
          fixed="left"
        />
        <Resource.Column<Workshop>
          title={I18n.t('admin.slot_name')}
          id="slot_name"
          width="15%"
          render={(_, { name }) => name}
        />
        <Resource.Column<Workshop>
          title={I18n.t('admin.scheduling_columns_duration')}
          id="duration"
          width="10%"
          render={(_, { duration }) => secondsToDayHoursAndMinutes(duration)}
        />
        <Resource.Column<Workshop>
          title={I18n.t('admin.scheduling_columns_campaign_name')}
          id="campaignName"
          render={(_, { campaign }) => campaign.name}
          width="10%"
          fixed="right"
        />
      </Resource.Table>
    </Resource>
  )
}
