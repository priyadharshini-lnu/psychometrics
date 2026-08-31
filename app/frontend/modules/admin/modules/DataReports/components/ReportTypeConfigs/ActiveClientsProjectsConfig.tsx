import React from 'react'
import {
  DatePicker, Form, Row, Col,
} from '@thetalententerprise/glint'
import { Dayjs } from 'dayjs'
import dayjs from '~/utils/dayjs'
import { ReportTypeConfigProps, ReportTypeDefinition } from './types'

const { I18n } = window

type ActiveClientsProjectsParsedConfiguration = {
  start_date?: string | number | dayjs.Dayjs
  end_date?: string | number | dayjs.Dayjs
  activity_period?: [string | number | dayjs.Dayjs, string | number | dayjs.Dayjs]
}

type ActiveClientsProjectsConfigProps = Omit<
  ReportTypeConfigProps,
  'parsedConfiguration'
> & {
  parsedConfiguration: ActiveClientsProjectsParsedConfiguration | null
}

type ActiveClientsProjectsFormData = Record<string, unknown> & {
  startDate?: Dayjs
  endDate?: Dayjs
}

const normalizeConfiguration = (
  parsedConfiguration: ActiveClientsProjectsParsedConfiguration | null,
) => {
  if (!parsedConfiguration) return null

  if (parsedConfiguration.start_date || parsedConfiguration.end_date) {
    return parsedConfiguration
  }

  if (!parsedConfiguration.activity_period) {
    return parsedConfiguration
  }

  return {
    ...parsedConfiguration,
    start_date: parsedConfiguration.activity_period[0],
    end_date: parsedConfiguration.activity_period[1],
  }
}

const ActiveClientsProjectsConfig: React.FC<ActiveClientsProjectsConfigProps> = ({
  parsedConfiguration,
}) => {
  const configuration = normalizeConfiguration(parsedConfiguration)
  const form = Form.useFormInstance()

  return (
    <Row gutter={16}>
      <Col xs={24} md={12}>
        <Form.Item
          name="startDate"
          label={I18n.t('admin.form_start_date')}
          initialValue={configuration?.start_date ? dayjs(configuration.start_date) : undefined}
          dependencies={['endDate']}
        >
          <DatePicker
            className="w-100"
            disabledDate={(current) => {
              if (!current) return false

              const endDate = form.getFieldValue('endDate') as Dayjs | undefined

              if (current.isAfter(dayjs().endOf('day'))) return true

              return !!endDate && current.isAfter(endDate, 'day')
            }}
          />
        </Form.Item>
      </Col>
      <Col xs={24} md={12}>
        <Form.Item
          name="endDate"
          label={I18n.t('admin.form_end_date')}
          initialValue={configuration?.end_date ? dayjs(configuration.end_date) : undefined}
          dependencies={['startDate']}
        >
          <DatePicker
            className="w-100"
            disabledDate={(current) => {
              if (!current) return false

              const startDate = form.getFieldValue('startDate') as Dayjs | undefined

              if (current.isAfter(dayjs().endOf('day'))) return true

              return !!startDate && current.isBefore(startDate, 'day')
            }}
          />
        </Form.Item>
      </Col>
    </Row>
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

  processConfiguration: (data) => {
    const formData = data as ActiveClientsProjectsFormData

    return {
      ...data,
      configuration: JSON.stringify({
        start_date: formData.startDate?.toISOString() ?? null,
        end_date: formData.endDate?.toISOString() ?? null,
      }),
      startDate: undefined,
      endDate: undefined,
    }
  },
}

export default ActiveClientsProjectsConfig
