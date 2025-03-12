import _ from 'lodash'
import { FC } from 'react'
import {
  TimePicker, Row, Col, Space, TimePickerProps, Form, FormInstance, Typography, Button,
} from 'antd'
import {
  PlusCircleOutlined, MinusCircleOutlined,
} from '@ant-design/icons'
import cs from 'classnames'
import dayjs from '~/utils/dayjs'
import {
  allMinutes,
  getDefaultTimesFromPreviousDays,
  getDisabledHourDataForEndTime,
} from './utils'
import styles from './ScheduleDay.less'


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

export const ScheduleDay:FC<Props> = ({
  label, formInstance, day, errorMessages,
}) => {
  const formName = day.toString()
  const fieldData = formInstance.getFieldValue(formName) || []
  const addTimeSlot = (name, add) => {
    const currentFieldData = formInstance.getFieldValue(formName)

    const currentDayEndTimestamp = dayjs(currentFieldData[0]?.endTime).date()
    const newEndTimeTimestamp = dayjs(currentFieldData[name]?.endTime, 'HH:mm:ss')
      .add(120, 'minutes')
      .subtract(1, 'second')
      .date()
    const newStartTime = dayjs(currentFieldData[name]?.endTime, 'HH:mm:ss').add(60, 'minutes')
    const newEndTime = dayjs(currentFieldData[name]?.endTime, 'HH:mm:ss').add(120, 'minutes')
    if (Number(newEndTimeTimestamp) === Number(currentDayEndTimestamp)) {
      add({
        startTime: newStartTime,
        endTime: newEndTime,
      })
    } else if (
      newEndTimeTimestamp > currentDayEndTimestamp
      && dayjs(currentFieldData[name]?.endTime, 'HH:mm:ss').isBefore(dayjs('23:59:59', 'HH:mm:ss'))
    ) {
      add({
        startTime: dayjs(currentFieldData[name]?.endTime, 'HH:mm:ss').add(1, 'minutes'),
        endTime: dayjs('23:59:59', 'HH:mm:ss'),
      })
    }
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
              const {
                disabledHours,
                disabledMins,
                startTimeHour,
              } = getDisabledHourDataForEndTime(name, fieldData)
              const startTime = fieldData[name]?.startTime as dayjs.Dayjs
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
                          <Button
                            disabled={fields.length === 1}
                            shape="circle"
                            aria-label="remove"
                            type="text"
                            icon={<MinusCircleOutlined />}
                            onClick={() => {
                              formInstance.setFieldValue(`label.${name}`, null)
                              remove(index)
                            }}
                          />
                        </div>
                        {index === (fields.length - 1) && (
                          <div className="mb-3">
                            <Button
                              shape="circle"
                              aria-label="add"
                              type="text"
                              disabled={!(fieldData[name]?.startTime && fieldData[name]?.endTime)}
                              icon={<PlusCircleOutlined />}
                              onClick={() => addTimeSlot(name, add)}
                            />
                          </div>
                        )}
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
                        <Button
                          shape="circle"
                          aria-label="add"
                          type="text"
                          icon={<PlusCircleOutlined />}
                          onClick={() => getDefaultTimesFromPreviousDays(day, formInstance, add)}
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
            <Typography.Text type="danger">{errorMessages.base as unknown as string}</Typography.Text>
          </Col>
        </Row>
      )}
    </>
  )
}
