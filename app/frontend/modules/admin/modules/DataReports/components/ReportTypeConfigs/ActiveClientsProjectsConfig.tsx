import React from 'react'
import { DatePicker, Form } from 'antd'
import { ReportTypeConfigProps, ReportTypeDefinition } from './types'
import dayjs from '~/utils/dayjs'

const { I18n } = window

type ActiveClientsProjectsParsedConfiguration = {
  activity_period?: [string | number | dayjs.Dayjs, string | number | dayjs.Dayjs]
}

type ActiveClientsProjectsConfigProps = Omit<
  ReportTypeConfigProps,
  'parsedConfiguration'
> & {
  parsedConfiguration: ActiveClientsProjectsParsedConfiguration | null
}

const ActiveClientsProjectsConfig: React.FC<ActiveClientsProjectsConfigProps> = ({
  parsedConfiguration,
}) => {
  const today = dayjs()
  const defaultRange: [dayjs.Dayjs, dayjs.Dayjs] = [
    today.startOf('day'),
    today.endOf('day'),
  ]

  const parsedRange = parsedConfiguration?.activity_period

  const initialRange: [dayjs.Dayjs, dayjs.Dayjs] = parsedRange && parsedRange.length === 2
    ? [dayjs(parsedRange[0]), dayjs(parsedRange[1])]
    : defaultRange

  return (
    <Form.Item
      name="activityPeriod"
      label={I18n.t('admin.activity_period')}
      initialValue={initialRange}
      rules={[{ required: true }]}
    >
      <DatePicker.RangePicker
        allowClear={false}
        ranges={{
          [I18n.t('admin.date_presets_today')]: [
            dayjs().startOf('day'),
            dayjs().endOf('day'),
          ],
          [I18n.t('admin.date_presets_yesterday')]: [
            dayjs().subtract(1, 'day').startOf('day'),
            dayjs().subtract(1, 'day').endOf('day'),
          ],
          [I18n.t('admin.date_presets_last_week')]: [
            dayjs().subtract(1, 'week').startOf('week'),
            dayjs().subtract(1, 'week').endOf('week'),
          ],
          [I18n.t('admin.date_presets_last_month')]: [
            dayjs().subtract(1, 'month').startOf('month'),
            dayjs().subtract(1, 'month').endOf('month'),
          ],
          [I18n.t('admin.date_presets_last_7_days')]: [
            dayjs().subtract(7, 'd'),
            dayjs(),
          ],
          [I18n.t('admin.date_presets_last_30_days')]: [
            dayjs().subtract(30, 'd'),
            dayjs(),
          ],
          [I18n.t('admin.date_presets_last_6_months')]: [
            dayjs().subtract(180, 'd'),
            dayjs(),
          ],
          [I18n.t('admin.date_presets_last_year')]: [
            dayjs().subtract(365, 'd'),
            dayjs(),
          ],
        }}
      />
    </Form.Item>
  )
}

export const activeClientsProjectsDefinition: ReportTypeDefinition = {
  key: 'active_clients_projects',
  component: ActiveClientsProjectsConfig,
  uiRules: {
    defaultScope: 'global',
    scopeOptions: ['global'],
    hideOwnerWhenGlobal: true,
  },
  processConfiguration: data => ({
    ...data,
    configuration: JSON.stringify({
      activity_period: data.activityPeriod
        ? [
          dayjs(data.activityPeriod[0]).toISOString(),
          dayjs(data.activityPeriod[1]).toISOString(),
        ]
        : null,
    }),
    activityPeriod: undefined,
  }),
}

export default ActiveClientsProjectsConfig
