import {
  useEffect, useState, FC,
} from 'react'
import {
  Space, Form, DatePicker, Button,
} from 'antd'
import moment, { Moment } from 'moment-timezone'
import cs from 'classnames'

import { ScheduleDay } from '~/glint/components/ScheduleAvailability/ScheduleDay'
import { Panel } from '~/glint'
import TimeZoneSelect from '~/components/TimeZoneSelect'
import { getAvailableDays } from '~/utils/time'

import styles from './ScheduleAvailability.less'

const allDays = moment.weekdays()
const dateDisplayFormat = 'Do MMMM YYYY'
const dateFormat = 'DD/MM/YYYY'
const { I18n } = window

type AvailabileDay = {
  day: number,
  timeSlots: {startTime: Moment, endTime: Moment}[]
}

type Availability = {
  timezone: string,
  startDate: Moment,
  endDate: Moment,
  availabilityDays: AvailabileDay[]
}

type Props = {
  id: string
  onFormSubmit: (availability: Availability) => void
  initialAvailability?: Availability
  onRemove?: (id: string) => void
}

export const ScheduleAvailability:FC<Props> = ({
  id, initialAvailability, onFormSubmit, onRemove,
}) => {
  const [timezone, setTimezone] = useState(initialAvailability?.timezone || moment.tz.guess() || 'Asia/Baku')
  const [dateFields, setDateFields] = useState({})
  const [availableWeekDays, setAvailableWeekDays] = useState(getAvailableDays(
    initialAvailability?.startDate, initialAvailability?.endDate,
  ))
  const isSavedSchedule = !!(initialAvailability?.startDate && initialAvailability?.endDate)
  const [dateSelectionForm] = Form.useForm()
  const initialDaysAvailability = {}
  initialAvailability?.availabilityDays
    .forEach((availableDay) => {
      initialDaysAvailability[availableDay.day] = availableDay.timeSlots
    })
  const initialAvailabilityFormData = {
    startDate: initialAvailability?.startDate.startOf('day'),
    endDate: initialAvailability?.endDate.endOf('day'),
    ...initialDaysAvailability,
  }

  let title = I18n.t('glint.schedule_availability.new_schedule')
  if (isSavedSchedule) {
    // eslint-disable-next-line max-len
    title = `${initialAvailability.startDate.clone().format(dateDisplayFormat)} - ${initialAvailability.endDate.clone().format(dateDisplayFormat)}`
  }
  const description = isSavedSchedule
    ? I18n.t('glint.schedule_availability.saved_schedule_description')
    : I18n.t('glint.schedule_availability.new_schedule_description')

  const startDate: Moment | undefined = dateSelectionForm.getFieldValue('startDate')
  const endDate: Moment | undefined = dateSelectionForm.getFieldValue('endDate')

  useEffect(() => {
    setAvailableWeekDays([...getAvailableDays(startDate, endDate)])
  }, [dateFields])

  const clearEndDate = () => {
    if (startDate && endDate && endDate.isBefore(startDate)) {
      dateSelectionForm.setFieldValue('endDate', null)
    }
  }

  const handleFormFinish = () => {
    if (startDate && endDate) {
      const daysAvailability = availableWeekDays
        .map(availableDay => ({ day: availableDay, timeSlots: dateSelectionForm.getFieldValue(availableDay) || [] }))

      const availabilityData: Availability = {
        timezone,
        startDate,
        endDate,
        availabilityDays: [...daysAvailability],
      }
      onFormSubmit(availabilityData)
    }
  }

  return (
    <div className="mt-20 ms-10 mb-20 me-10">
      <Panel
        title={title}
        description={description}
        collapsible
        removable
        onRemove={() => onRemove && onRemove(id)}
        defaultOpen={!isSavedSchedule}
      >
        <Space className="w-100" size="middle" direction="vertical">
          <div className={styles.timezone}>
            <Space direction="vertical" className="w-100">
              {I18n.t('glint.schedule_availability.timezone_label')}
              <TimeZoneSelect value={timezone} onChange={setTimezone} />
            </Space>
          </div>
          <Form
            layout="inline"
            form={dateSelectionForm}
            onFieldsChange={(_, allFields) => {
              allFields[0].value?.startOf('day')
              allFields[1].value?.endOf('day')
              setDateFields(allFields)
              clearEndDate()
            }}
            name="datesForm"
            requiredMark={false}
            initialValues={initialAvailabilityFormData}
            validateMessages={{ required: I18n.t('glint.schedule_availability.required_error') }}
            onFinish={handleFormFinish}
          >
            <Form.Item
              name="startDate"
              labelAlign="left"
              labelCol={{ span: 10 }}
              colon={false}
              label={<div className="font-normal">{I18n.t('glint.schedule_availability.start_date')}</div>}
              rules={[{ required: true }]}
              className={styles.dateFormItem}
            >
              <DatePicker format={dateFormat} />
            </Form.Item>
            <Form.Item
              name="endDate"
              labelAlign="left"
              labelCol={{ span: 10 }}
              colon={false}
              label={<div className="font-normal">{I18n.t('glint.schedule_availability.end_date')}</div>}
              rules={[{ required: true }]}
              className={styles.dateFormItem}
            >
              <DatePicker
                format={dateFormat}
                disabledDate={(date) => {
                  const startDate = dateSelectionForm.getFieldValue('startDate')
                  if (!startDate) {
                    return false
                  }
                  return date.isBefore(startDate)
                }}
              />
            </Form.Item>
            <div className={cs(styles.daysContainer, 'mt-10')}>
              <Space size="small" direction="vertical">
                {availableWeekDays
                  .map(day => (
                    <ScheduleDay
                      formInstance={dateSelectionForm}
                      key={day}
                      formName={day.toString()}
                      label={allDays[day]}
                    />
                  ))}
              </Space>
            </div>
            <Form.Item className="w-100 ta-e">
              <Button htmlType="submit" type="primary">{I18n.t('glint.schedule_availability.save')}</Button>
            </Form.Item>
          </Form>
        </Space>
      </Panel>
    </div>
  )
}
