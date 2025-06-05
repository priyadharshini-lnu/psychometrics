import React, { useState, useEffect } from 'react'
import {
  DatePicker, Form, Row, Space, Col, TimePicker, Radio, Button, Tag, Input, Switch, Select,
} from 'antd'
import { Store } from 'antd/lib/form/interface'
import _ from 'lodash'
import { useParams } from 'react-router-dom'
import dayjs from '~/utils/dayjs'
import TimeZoneSelect from '~/components/TimeZoneSelect'
import InputDuration from '~/components/InputDuration'
import { Panel } from '~/glint/components/Panel/Panel'
import { useResources } from '~/hooks/useResources'
import styles from './Form.less'
import { ResourcesItems } from './ResourcesItems'
import { durationValidator } from '../utils'

const fieldLayout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 },
}

const { I18n } = window

interface Props {
  initialValues: {
    dates: dayjs.Dayjs[] | null
    timezone: string
    video_call_type: number
  }
  onNext: (values: Store) => void
  onCancel?: () => void
}

interface AssessmentCenterGroup {
  id: string
  name: string
}

export const BasicInfoForm: React.FC<Props> = ({ initialValues, onNext, onCancel }) => {
  const [form] = Form.useForm()

  const [selectedDates, setSelectedDates] = useState<dayjs.Dayjs[]>(initialValues.dates || [])
  const [videoCallType, setVideoCallType] = useState<number>(initialValues.video_call_type)
  const [dateFieldStatus, setDateFieldStatus] = useState<'success' | 'error'>('success')
  const [assessmentCenterGroups, setAssessmentCenterGroups] = useState<AssessmentCenterGroup[]>([])

  const { campaignId } = useParams<{ campaignId: string }>()

  const {
    collectionAction: assessmentGroupsAction,
  } = useResources<AssessmentCenterGroup>(
    'campaign_assessment_groups',
    {
      basePath: `campaigns/${campaignId}`,
    },
  )

  const sortDates = (dates: dayjs.Dayjs[]) => dates.sort((a, b) => a.valueOf() - b.valueOf())

  useEffect(() => {
    assessmentGroupsAction({
      action: '',
      method: 'get',
      apiConfig: {
        filter: { group_type_eq: '1' },
      },
    })
      .then((response) => {
        setAssessmentCenterGroups(response as AssessmentCenterGroup[])
      })
      .catch((error) => {
        console.error('Failed to load assessment center groups:', error)
      })
  }, [campaignId])

  const handleDateChange = (date: dayjs.Dayjs) => {
    if (!date) {
      return
    }

    const existingIndex = selectedDates.map(d => d.format('YYYY MM DD')).indexOf(date.format('YYYY MM DD'))
    if (existingIndex >= 0) {
      const newDates = selectedDates.filter(d => d.format('YYYY MM DD') !== date.format('YYYY MM DD'))
      setDateFieldStatus(newDates.length ? 'success' : 'error')
      setSelectedDates(sortDates(newDates))
    }
    if (existingIndex < 0 && date && selectedDates.length < 5) {
      setDateFieldStatus('success')
      setSelectedDates(sortDates([...selectedDates, date]))
    }
  }

  const handleNext = () => {
    form.validateFields().then((values) => {
      selectedDates.length ? onNext({ ...values, dates: selectedDates }) : setDateFieldStatus('error')
    }).catch(() => {
      !selectedDates.length && setDateFieldStatus('error')
    })
  }

  const handleCancel = () => {
    onCancel?.()
  }

  const handleTagClose = (closedDate: dayjs.Dayjs) => {
    const updatedDates = selectedDates.filter(date => date !== closedDate)
    setDateFieldStatus(updatedDates.length ? 'success' : 'error')
    setSelectedDates(updatedDates)
  }

  return (
    <Space direction="vertical" size="large" style={{ display: 'flex' }}>
      <Panel
        title={I18n.t('administration.scheduling.assessment_center_form.basic_info_panel.title')}
        description={I18n.t('administration.scheduling.assessment_center_form.basic_info_panel.description')}
      >
        <Form
          requiredMark={false}
          className={styles.form}
          layout="vertical"
          form={form}
          initialValues={{ ...initialValues, dates: initialValues.dates?.length ? initialValues.dates : null }}
        >
          <Row gutter={16}>
            <Col xs={24} sm={12} lg={8}>
              <Form.Item
                label={I18n.t('administration.scheduling.assessment_center_form.dates_label')}
                {...fieldLayout}
                validateStatus={dateFieldStatus}
                help={dateFieldStatus === 'success' ? '' : I18n.t('administration.scheduling.errors.date_required')}
              >
                <DatePicker
                  format="DD/MM/YYYY"
                  value={null}
                  onCalendarChange={handleDateChange}
                  disabledDate={current => current && current.isBefore(dayjs().startOf('day'))}
                  dateRender={(current) => {
                    const style: React.CSSProperties = {}
                    const found = selectedDates.find(d => d.format('YYYY MM DD') === current.format('YYYY MM DD'))
                    if (found) {
                      style.backgroundColor = 'var(--ant-primary-color)'
                      style.color = '#fff'
                    }
                    return (
                      <div className="ant-picker-cell-inner" style={style}>
                        {current.date()}
                      </div>
                    )
                  }}
                  style={{ width: '200px' }}
                />
                {selectedDates.length ? (
                  <div className={styles.dateTags}>
                    {selectedDates.map(date => (
                      <Tag
                        key={date.toISOString()}
                        closable
                        onClose={() => handleTagClose(date)}
                      >
                        {date.format('Do, MMMM, YYYY').toString()}
                      </Tag>
                    ))}
                  </div>
                ) : null}
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Form.Item
                name="campaign_assessment_group_id"
                label={I18n.t('administration.scheduling.assessment_center_form.assessment_center_group')}
                {...fieldLayout}
                rules={[{ required: true }]}
              >
                <Select
                  placeholder={
                    I18n.t('administration.scheduling.assessment_center_form.assessment_center_group_placeholder')}
                >
                  {_.map(assessmentCenterGroups, (assessmentCenterGroup: AssessmentCenterGroup) => (
                    <Select.Option key={assessmentCenterGroup.id} value={assessmentCenterGroup.id}>
                      {assessmentCenterGroup.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12} lg={8}>
              <Form.Item
                name="timezone"
                label={I18n.t('administration.scheduling.assessment_center_form.timezone_label')}
                {...fieldLayout}
                rules={[{ required: true }]}
              >
                <TimeZoneSelect value="" onChange={() => {}} />
              </Form.Item>
            </Col>
            <Col xs={12} sm={6} lg={4}>
              <Form.Item
                name="time"
                label={I18n.t('administration.scheduling.assessment_center_form.time_label')}
                {...fieldLayout}
                rules={[{
                  required: true,
                  message: I18n.t('validations.blank'),
                }]}
              >
                <TimePicker format="h:mm A" use12Hours minuteStep={15} showNow={false} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={12} sm={6} lg={4}>
              <Form.Item
                name="duration"
                label={I18n.t('administration.scheduling.assessment_center_form.duration_label')}
                {...fieldLayout}
                rules={[
                  {
                    validator: durationValidator({
                      minMinutes: 15,
                      maxMinutes: 16 * 60,
                      minError: I18n.t('administration.scheduling.assessment_center_form.duration_min_error'),
                      maxError: I18n.t('administration.scheduling.assessment_center_form.duration_max_error'),
                      requiredError: I18n.t('administration.scheduling.assessment_center_form.required_error'),
                    }),
                  },
                ]}
              >
                <InputDuration
                  value=""
                  onChange={() => {}}
                  placeholder={I18n.t('administration.scheduling.assessment_center_form.duration_placeholder')}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={12} lg={8}>
              <Form.Item
                name="cancellation_lead_time"
                label={I18n.t('administration.scheduling.assessment_center_form.cancellation_lead_time_label')}
                {...fieldLayout}
                rules={[
                  {
                    validator: durationValidator({
                      minMinutes: 1,
                      maxMinutes: 24 * 60 * 30,
                      // eslint-disable-next-line max-len
                      minError: I18n.t('administration.scheduling.assessment_center_form.reschedule_duration_min_error'),
                      // eslint-disable-next-line max-len
                      maxError: I18n.t('administration.scheduling.assessment_center_form.reschedule_duration_max_error'),
                      requiredError: I18n.t('administration.scheduling.assessment_center_form.required_error'),
                    }),
                  },
                ]}
              >
                <InputDuration
                  value=""
                  onChange={() => {}}
                  placeholder={I18n.t('administration.components.input_duration.placeholder')}
                />
              </Form.Item>
            </Col>
            <Col xs={12} lg={8}>
              <Form.Item
                name="scheduling_lead_time"
                label={I18n.t('administration.scheduling.assessment_center_form.scheduling_lead_time_label')}
                {...fieldLayout}
                rules={[
                  {
                    validator: durationValidator({
                      minMinutes: 1,
                      maxMinutes: 24 * 60 * 30, // 30 days
                      // eslint-disable-next-line max-len
                      minError: I18n.t('administration.scheduling.assessment_center_form.reschedule_duration_min_error'),
                      // eslint-disable-next-line max-len
                      maxError: I18n.t('administration.scheduling.assessment_center_form.reschedule_duration_max_error'),
                      requiredError: I18n.t('administration.scheduling.assessment_center_form.required_error'),
                    }),
                  },
                ]}
              >
                <InputDuration
                  value=""
                  onChange={() => {}}
                  placeholder={I18n.t('administration.components.input_duration.placeholder')}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label={I18n.t('administration.scheduling.assessment_center_form.allow_late_cancellation_and_scheduling')}
            {...fieldLayout}
            name="allow_late_cancellation_and_rescheduling"
            rules={[{ required: true }]}
            valuePropName="checked"
            initialValue={false}
          >
            <Switch />
          </Form.Item>
          <Form.Item
            label={I18n.t('administration.scheduling.assessment_center_form.video_call_type_label')}
            {...fieldLayout}
            name="video_call_type"
            rules={[{ required: true }]}
          >
            <Radio.Group onChange={e => setVideoCallType(e.target.value)}>
              <Radio value={0}>
                {I18n.t('administration.scheduling.assessment_center_form.video_call_type.none')}
              </Radio>
              <Radio value={1}>
                {I18n.t('administration.scheduling.assessment_center_form.video_call_type.internal')}
              </Radio>
              <Radio value={2}>
                {I18n.t('administration.scheduling.assessment_center_form.video_call_type.custom')}
              </Radio>
            </Radio.Group>
          </Form.Item>
          {videoCallType === 2 && (
            <Form.Item
              label={I18n.t('administration.scheduling.assessment_center_form.meeting_link')}
              name="meeting_link"
              {...fieldLayout}
              rules={[{
                required: true,
                message: I18n.t('administration.scheduling.assessment_center_form.required_error'),
              },
              { type: 'url', message: I18n.t('administration.scheduling.errors.invalid_url') },
              {
                pattern: /^https:\/\/(.*)/,
                message: I18n.t('administration.scheduling.errors.meeting_link_https'),
              }]}
            >
              <Input />
            </Form.Item>
          )}
        </Form>
      </Panel>
      <Panel
        title={I18n.t('administration.scheduling.assessment_center_form.resources_panel.title')}
        description={I18n.t('administration.scheduling.assessment_center_form.resources_panel.description')}
      >
        <Form requiredMark={false} className={styles.form} layout="vertical" form={form} initialValues={initialValues}>
          <ResourcesItems />
        </Form>
      </Panel>
      <div className={styles.footer}>
        <Space>
          {
            onCancel && (
              <Button onClick={handleCancel}>
                {I18n.t('common.actions.cancel')}
              </Button>
            )
          }
          <Button type="primary" onClick={handleNext}>
            {I18n.t('administration.scheduling.assessment_center_form.next')}
          </Button>
        </Space>
      </div>
    </Space>
  )
}
