import _ from 'lodash'
import { FC } from 'react'
import {
  TimePicker, Row, Col, Space, TimePickerProps, Form, FormInstance, Typography,
} from 'antd'
import { PlusOutlined, CloseOutlined } from '@ant-design/icons'
import cs from 'classnames'

import moment from 'moment'
import { LightBackgroundButton } from '~/glint'
import styles from './ScheduleDay.less'

const allHours = _.range(0, 24)
const allMinutes = _.range(0, 60, 5)

type Props = {
  label: string,
  day: number,
  formInstance: FormInstance
  errorMessages?: {
    [key: string]: Record<string, string>
  }
}

const { Text } = Typography
const { I18n } = window

const defaultTimePickerProps: TimePickerProps = {
  showNow: false, minuteStep: 15, use12Hours: true, format: 'h:mm A',
}

type DisbledHoursData = {
  disabledHours: number[]
  disabledMins: number[]
  startTimeHour?: number
}

export const ScheduleDay:FC<Props> = ({
  label, formInstance, day, errorMessages,
}) => {
  const formName = day.toString()
  const fieldData = formInstance.getFieldValue(formName) || []

  const getDisabledHourDataForEndTime = (fieldDataIndex: number):DisbledHoursData => {
    const startTime = fieldData[fieldDataIndex]?.startTime
    if (!startTime) {
      return { disabledHours: [], disabledMins: [] }
    }

    const startTimeHour = startTime?.hour()
    const startTimeMinutes = startTime?.minutes()
    const disabledHours = allHours.filter((hour) => {
      if (startTimeMinutes === 55) {
        hour <= startTimeHour
      }
      return hour < startTimeHour
    })
    const disabledMins = allMinutes.filter(minutes => minutes <= startTimeMinutes)
    return ({ disabledHours, disabledMins, startTimeHour })
  }

  return (
    <>
      <Form.List
        name={formName}
      >
        {(fields, { add, remove }) => (
          <Form.Item
            className="mb-0"
            labelAlign="left"
            label={_.capitalize(label)}
            wrapperCol={{ span: 18 }}
            labelCol={{ span: 6 }}
            colon={false}
          >
            {fields.map(({ key, name, ...restField }, index) => {
              const { disabledHours, disabledMins, startTimeHour } = getDisabledHourDataForEndTime(name)
              const startTime = fieldData[name]?.startTime
              const errors = errorMessages?.[index.toString()] || {}

              return (
                <>
                  <Row key={key} wrap={false} gutter={[10, 0]}>
                    <Col span={20}>
                      <Space direction="horizontal" size="small" align="baseline">
                        <Form.Item
                          rules={[{ required: true }]}
                          {...restField}
                          name={[name, 'startTime']}
                          className="mb-3"
                          validateStatus={errors.startTime ? 'error' : undefined}
                          help={errors.startTime}
                        >
                          <TimePicker
                            placeholder={I18n.t('glint.schedule_availability.from')}
                            {...defaultTimePickerProps}
                          />
                        </Form.Item>
                        <Form.Item
                          rules={[{ required: true }]}
                          name={[name, 'endTime']}
                          {...restField}
                          className="mb-3 me-0"
                          validateStatus={errors.endTime ? 'error' : undefined}
                          help={errors.endTime}
                        >
                          <TimePicker
                            placeholder={I18n.t('glint.schedule_availability.to')}
                            {...defaultTimePickerProps}
                            disabledTime={() => ({
                              disabledHours: () => disabledHours,
                              disabledMinutes: (hour) => {
                                if (hour < (startTimeHour || -1)) {
                                  return allMinutes
                                }
                                return hour === startTimeHour ? disabledMins : []
                              },
                            })}
                            disabledDate={time => time.isSameOrBefore(startTime)}
                          />
                        </Form.Item>
                      </Space>
                    </Col>
                    <Col>
                      <Space direction="horizontal">
                        <div className="mb-3">
                          <LightBackgroundButton
                            aria-label="add"
                            disabled={!(fieldData[name]?.startTime && fieldData[name]?.endTime)}
                            icon={<PlusOutlined />}
                            onClick={() => {
                              add(
                                {
                                  startTime: moment(fieldData[name]?.endTime, 'HH:mm:ss').add(1, 'hours'),
                                  endTime: moment(fieldData[name]?.endTime, 'HH:mm:ss').add(2, 'hours'),
                                },
                              )
                            }
                            }
                          />
                        </div>
                        <div className="mb-3">
                          <LightBackgroundButton
                            aria-label="remove"
                            icon={<CloseOutlined />}
                            onClick={() => {
                              formInstance.setFieldValue(`label.${name}`, null)
                              remove(index)
                            }}
                          />
                        </div>
                      </Space>
                    </Col>
                  </Row>
                  {errors.base && (
                  <Row className="mb-3" style={{ marginTop: '-8px' }}>
                    <Col span={20}>
                      <Typography.Text type="danger">
                        {errors.base}
                      </Typography.Text>
                    </Col>
                  </Row>
                  )}
                </>
              )
            })}
            {!fields.length
              ? (
                <Row wrap={false} gutter={[10, 0]}>
                  <Col span={20}>
                    <Form.Item className="mb-3 me-0">
                      <div className={cs(styles.dashed, 'pb-1 pt-1 w-100 ta-c')}>
                        <Text type="secondary">{I18n.t('glint.schedule_availability.no_slots')}</Text>
                      </div>
                    </Form.Item>
                  </Col>
                  <Col>
                    <Space size="small" direction="horizontal">
                      <Form.Item className="mb-3">
                        <LightBackgroundButton
                          aria-label="add"
                          icon={<PlusOutlined />}
                          onClick={() => add({
                            startTime: moment('9:00:00', 'HH:mm:ss'),
                            endTime: moment('17:00:00', 'HH:mm:ss'),
                          })}
                        />
                      </Form.Item>
                    </Space>
                  </Col>
                </Row>
              ) : null}
          </Form.Item>
        )}
      </Form.List>
      {errorMessages?.base && (
      <Row className="mb-3" style={{ marginTop: '-8px' }}>
        <Col span={18} offset={6}>
          <Typography.Text type="danger">{errorMessages.base}</Typography.Text>
        </Col>
      </Row>
      )}
    </>
  )
}
