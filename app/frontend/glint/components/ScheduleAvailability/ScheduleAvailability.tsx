import {
  useEffect, useState, FC,
} from 'react'
import _ from 'lodash'
import {
  Space, Form, DatePicker, Button, Typography, Alert, Row, Col,
} from 'antd'
import moment, { Moment } from 'moment-timezone'
import cs from 'classnames'

import { CopyOutlined } from '@ant-design/icons'
import { ScheduleDay } from '~/glint/components/ScheduleAvailability/ScheduleDay'
import { Panel } from '~/glint'
import TimeZoneSelect from '~/components/TimeZoneSelect'
import { getAvailableDays } from '~/utils/time'

import styles from './ScheduleAvailability.less'
import { UserAvailabilityDate, UserAvailabilityDay, ErrorMessage } from './interfaces'
import { getErrorsForDay } from './getErrorsForDay'

const allDays = moment.weekdays()
const dateDisplayFormat = 'Do MMMM YYYY'
const dateFormat = 'DD/MM/YYYY'
const { I18n } = window

type Props = {
  id: string
  onFormSubmit?: (userAvailability: UserAvailabilityDate) => Promise<unknown>
  initialAvailability?: UserAvailabilityDate
  onRemove?: (id: string) => void
  className?: string
  collapsed?: boolean
  errorMessages?: ErrorMessage
  removable?: boolean
}

export const ScheduleAvailability:FC<Props> = ({
  id, initialAvailability, onFormSubmit, onRemove, className, collapsed = false, errorMessages, removable = true,
}) => {
  let parsedUserAvailabilities
  let initialAvailabilityDays
  if (initialAvailability) {
    const sortedAvailabilityDays = _.sortBy(
      initialAvailability.availabilityDays, o => moment(o.endTime, 'hh:mm'),
    )
    initialAvailabilityDays = sortedAvailabilityDays.reduce(
      (val, userAvailabilityDay) => {
        const { day } = userAvailabilityDay
        val[day] ||= []
        val[day].push({
          startTime: moment(userAvailabilityDay.startTime, 'hh:mm'),
          endTime: moment(userAvailabilityDay.endTime, 'hh:mm'),
        })
        return val
      },
      { } as UserAvailabilityDay<Moment>,
    )

    parsedUserAvailabilities = {
      ...initialAvailability,
      startDate: moment(initialAvailability.startDate),
      endDate: moment(initialAvailability.endDate),
      availabilityDays: initialAvailabilityDays,
    }
  }

  const [timezone, setTimezone] = useState(initialAvailability?.timezone || 'Asia/Dubai')
  const [dateFields, setDateFields] = useState({})
  const [saving, setSaving] = useState(false)
  const [availableWeekDays, setAvailableWeekDays] = useState(getAvailableDays(
    parsedUserAvailabilities?.startDate, parsedUserAvailabilities?.endDate,
  ))
  const isSavedSchedule = !!(initialAvailability?.startDate && initialAvailability?.endDate)
  const [dateSelectionForm] = Form.useForm()
  const initialAvailabilityFormData = {
    startDate: parsedUserAvailabilities?.startDate.startOf('day'),
    endDate: parsedUserAvailabilities?.endDate.endOf('day'),
    ...parsedUserAvailabilities?.availabilityDays,
  }

  let title = I18n.t('glint.schedule_availability.new_schedule')
  if (isSavedSchedule && parsedUserAvailabilities) {
    // eslint-disable-next-line max-len
    title = `${parsedUserAvailabilities.startDate.clone().format(dateDisplayFormat)} - ${parsedUserAvailabilities.endDate.clone().format(dateDisplayFormat)}`
  }
  const description = isSavedSchedule
    ? I18n.t('glint.schedule_availability.saved_schedule_description')
    : I18n.t('glint.schedule_availability.new_schedule_description')

  const startDate: Moment | undefined = dateSelectionForm.getFieldValue('startDate')
  const endDate: Moment | undefined = dateSelectionForm.getFieldValue('endDate')

  useEffect(() => {
    setAvailableWeekDays([...getAvailableDays(startDate, endDate)])
  }, [dateFields, startDate, endDate])

  const clearEndDate = () => {
    if (startDate && endDate && endDate.isBefore(startDate)) {
      dateSelectionForm.setFieldValue('endDate', null)
    }
  }

  const handleFormFinish = () => {
    if (startDate && endDate) {
      const userAvailabilityDays: UserAvailabilityDay[] = availableWeekDays
        .flatMap(day => dateSelectionForm.getFieldValue(day)?.map(userAvailabilityDay => ({
          ...userAvailabilityDay,
          day,
          startTime: userAvailabilityDay.startTime?.format('HH:mm'),
          endTime: userAvailabilityDay.endTime?.format('HH:mm'),
        })))

      const availabilityData = {
        timezone,
        startDate: startDate?.format('YYYY-MM-DD'),
        endDate: endDate?.format('YYYY-MM-DD'),
        availabilityDays: _.compact(userAvailabilityDays),
      }
      setSaving(true)
      onFormSubmit && onFormSubmit(availabilityData).finally(() => {
        setSaving(false)
      })
    }
  }

  const handleCopyToALl = () => {
    const firstFiled = dateSelectionForm.getFieldValue(availableWeekDays[0])
    availableWeekDays.forEach((day) => {
      dateSelectionForm.setFieldValue(day, firstFiled)
    })
    setDateFields(dateSelectionForm.getFieldsValue())
  }

  const dateRangeError = errorMessages?.startDate?.title || errorMessages?.endDate?.title

  return (
    <Panel
      title={title}
      description={description}
      collapsible
      removable={removable}
      onRemove={() => onRemove && onRemove(id)}
      defaultOpen={!collapsed}
      className={className}
    >
      <Space className="w-100" size="middle" direction="vertical">
        {errorMessages?.base?.title && <Alert type="error" description={errorMessages.base.title} />}
        <div className={styles.timezone}>
          <Space direction="vertical" className="w-100">
            {I18n.t('glint.schedule_availability.timezone_label')}
            <TimeZoneSelect value={timezone} onChange={setTimezone} />
          </Space>
          {errorMessages?.timezone?.title
            && <Typography.Text type="danger">{errorMessages.timezone.title}</Typography.Text>}
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
          {dateRangeError && (
          <div style={{ flexBasis: '100%', marginTop: '-8px' }}>
            <Typography.Text type="danger">{dateRangeError}</Typography.Text>
          </div>
          )}
          <div className={cs(styles.daysContainer, 'mt-10')}>
            <Space size="small" direction="vertical">
              {availableWeekDays
                .map((day, index) => (
                  <Row wrap={false} gutter={[4, 0]}>
                    <Col span={20}>
                      <ScheduleDay
                        formInstance={dateSelectionForm}
                        key={day}
                        day={day}
                        label={allDays[day]}
                        errorMessages={
                        getErrorsForDay(day, errorMessages, dateSelectionForm.getFieldsValue())
                      }
                      />
                    </Col>
                    <Col>
                      {
                        index === 0 && (
                        <Button type="link" onClick={handleCopyToALl}>
                          <CopyOutlined />
                          {I18n.t('glint.schedule_availability.copy_to_all')}
                        </Button>
                        )
                    }
                    </Col>
                  </Row>
                ))}
            </Space>
          </div>
          <Form.Item className="w-100 ta-e">
            <Button htmlType="submit" type="primary" loading={saving}>
              {I18n.t('glint.schedule_availability.save')}
            </Button>
          </Form.Item>
        </Form>
      </Space>
    </Panel>
  )
}
