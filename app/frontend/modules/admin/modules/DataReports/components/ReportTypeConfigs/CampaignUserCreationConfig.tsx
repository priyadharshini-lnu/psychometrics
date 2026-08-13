import React from 'react'
import { DatePicker, Form } from 'antd'
import { ReportTypeConfigProps, ReportTypeDefinition } from './types'
import ProjectSearchField from './ProjectSearchField'
import dayjs from '~/utils/dayjs'

const { I18n } = window

const CampaignUserCreationConfig: React.FC<ReportTypeConfigProps> = ({
  parsedConfiguration,
  scope,
  ownerId,
}) => (
  <>
    <ProjectSearchField
      scope={scope}
      ownerId={ownerId}
      parsedConfiguration={parsedConfiguration}
      required
    />
    <Form.Item
      name="dateRange"
      label={I18n.t('admin.date_range')}
      initialValue={
            parsedConfiguration?.start_date && parsedConfiguration?.end_date
              ? [
                dayjs(parsedConfiguration.start_date as string),
                dayjs(parsedConfiguration.end_date as string),
              ]
              : undefined
          }
    >
      <DatePicker.RangePicker />
    </Form.Item>
  </>
)

export const campaignUserCreationDefinition: ReportTypeDefinition = {
  key: 'campaign_user_creation',
  component: CampaignUserCreationConfig,
  processConfiguration: (data) => {
    const projectIds = (data.projectIds as string[]) || []

    return {
      ...data,
      configuration: JSON.stringify({
        project_ids: projectIds.map(id => parseInt(id, 10)),
        start_date: data.dateRange
          ? dayjs(data.dateRange[0]).format('YYYY-MM-DD')
          : null,
        end_date: data.dateRange
          ? dayjs(data.dateRange[1]).format('YYYY-MM-DD')
          : null,
      }),
      projectIds: undefined,
      dateRange: undefined,
    }
  },
  uiRules: {
    defaultScope: 'client',
    scopeOptions: ['client'],
  },
}

export default CampaignUserCreationConfig
