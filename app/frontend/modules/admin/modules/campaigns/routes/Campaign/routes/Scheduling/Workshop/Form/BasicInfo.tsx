import { useState } from 'react'
import {
  DatePicker, Form, Row, Space, Col, TimePicker, Radio, Button, Tag, Input,
} from 'antd'
import { Moment } from 'moment'
import { Store } from 'antd/lib/form/interface'
import TimeZoneSelect from '~/components/TimeZoneSelect'
import InputDuration from '~/components/InputDuration'
import { Panel } from '~/glint/components/Panel/Panel'
import styles from './Form.less'
import { ResourcesItems } from './ResourcesItems'

const fieldLayout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 },
}

const { I18n } = window

interface Props {
  initialValues: {
    dates: Moment[]
  }
  onNext: (values: Store) => void
}

export const BasicInfoForm: React.FC<Props> = ({ initialValues, onNext }) => {
  const [form] = Form.useForm()

  const [selectedDates, setSelectedDates] = useState<Moment[]>([])
  const [videoCallType, setVideoCallType] = useState<number>(0)

  const preSelectedDates = initialValues.dates

  const tagDates = preSelectedDates || selectedDates.slice(0, 6)

  const handleDateChange = (date: Moment | null) => {
    if (date && !(selectedDates.length > 5)) {
      setSelectedDates([...selectedDates, date])
    }
  }

  const handleNext = () => {
    form.setFieldValue('dates', selectedDates)
    form.validateFields().then((values) => {
      onNext(values)
    })
  }

  const handleTagClose = (closedDate: Moment) => {
    const updatedDates = selectedDates.filter(date => date !== closedDate)
    setSelectedDates(updatedDates)
  }

  return (
    <Space direction="vertical" size="large" style={{ display: 'flex' }}>
      <Panel
        title={I18n.t('administration.scheduling.assessment_center_form.basic_info_panel.title')}
        description={I18n.t('administration.scheduling.assessment_center_form.basic_info_panel.description')}
      >
        <Form requiredMark={false} className={styles.form} layout="vertical" form={form} initialValues={initialValues}>
          <Form.Item
            name="dates"
            label={I18n.t('administration.scheduling.assessment_center_form.dates_label')}
            {...fieldLayout}
            rules={[{ required: true }]}
            validateStatus={selectedDates.length > 5 ? 'error' : ''}
            help={
              selectedDates.length > 5 ? I18n.t('administration.scheduling.assessment_center_form.dates_error') : ''
            }
          >
            <DatePicker onSelect={date => handleDateChange(date)} />
            <div className={styles.dateTags}>
              {tagDates.map(date => (
                <Tag
                  key={date.toISOString()}
                  closable
                  onClose={() => handleTagClose(date)}
                >
                  {date.format('Do, MMMM, YYYY').toString()}
                </Tag>
              ))}
            </div>
          </Form.Item>
          <Row>
            <Col span={7}>
              <Form.Item
                name="timezone"
                label={I18n.t('administration.scheduling.assessment_center_form.timezone_label')}
                {...fieldLayout}
                rules={[{ required: true }]}
              >
                <TimeZoneSelect value="" onChange={() => {}} />
              </Form.Item>
            </Col>
            <Col span={4} offset={1}>
              <Form.Item
                name="time"
                label="Time"
                {...fieldLayout}
                rules={[{ required: true }]}
              >
                <TimePicker format="HH:mm" />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item
                name="duration"
                label={I18n.t('administration.scheduling.assessment_center_form.duration_label')}
                {...fieldLayout}
                rules={[{ required: true }]}
              >
                <InputDuration
                  value=""
                  onChange={() => {}}
                  placeholder={I18n.t('administration.components.input_duration.placeholder')}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={7}>
              <Form.Item
                name="cancellation_lead_time"
                label={I18n.t('administration.scheduling.assessment_center_form.cancellation_lead_time_label')}
                {...fieldLayout}
                rules={[{ required: true }]}
              >
                <InputDuration
                  value=""
                  onChange={() => {}}
                  placeholder={I18n.t('administration.components.input_duration.placeholder')}
                />
              </Form.Item>
            </Col>
            <Col span={6} offset={1}>
              <Form.Item
                name="reschedule_lead_time"
                label={I18n.t('administration.scheduling.assessment_center_form.reschedule_lead_time_label')}
                {...fieldLayout}
                rules={[{ required: true }]}
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
        </Form>
        {videoCallType === 2 && (
          <Form.Item
            label="Meeting Link"
            name="meeting_link"
            {...fieldLayout}
          >
            <Input />
          </Form.Item>
        )}
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
          <Button type="primary" onClick={handleNext}>
            {I18n.t('administration.scheduling.assessment_center_form.next')}
          </Button>
        </Space>
      </div>
    </Space>
  )
}
