import React, { useEffect } from 'react'
import {
  Modal, Form, Button, DatePicker, Row, Col, Checkbox,
} from 'antd'
import { connect } from 'react-redux'
import moment from 'moment'
import Assessment from '~/modules/admin/modules/campaigns/interfaces/Assessment'
import { scheduleAssessment } from '~/modules/admin/modules/campaigns/core/userAssessments'

interface Props {
  close(): void
  campaignId: number
  assessment: Assessment
  scheduleAssessment: (campaignId: number, assessmentId: number, data: object) => Promise<{response}>
}

const { I18n } = window

const connector = connect(null, { scheduleAssessment })

export const SchedulingAssessment: React.FC<Props> = ({
  close, campaignId, assessment, scheduleAssessment,
}) => {
  const [form] = Form.useForm()
  const unscheduled = Form.useWatch('unschedule', form)

  useEffect(() => {
    form.setFieldsValue({
      scheduleTime: moment(assessment.scheduleTime || new Date()),
    })
  }, [])

  const schedule = () => {
    scheduleAssessment(campaignId, assessment.id,
      {
        scheduleTime: unscheduled ? null : form.getFieldValue('scheduleTime')?.toDate(),
      }).then(() => {
      close()
    })
  }

  return (
    <Modal
      open
      title={I18n.t('campaign_assessment.scheduling_time')}
      onCancel={() => close()}
      footer={
        [
          <Button onClick={() => close()}>
            {I18n.t('common.actions.cancel')}
          </Button>,
          <Button type="primary" onClick={schedule}>
            {I18n.t('common.actions.schedule')}
          </Button>,
        ]
      }
    >
      <Row gutter={[16, 16]}>
        <Col span="24">
          <Form form={form}>
            <Form.Item name="unschedule" valuePropName="checked">
              <Checkbox>
                {I18n.t('common.column.unschedule')}
              </Checkbox>
            </Form.Item>
            {!unscheduled && (
              <Form.Item name="scheduleTime" required>
                <DatePicker
                  allowClear
                  format="YYYY/MM/DD hh:mm a"
                  showTime
                  minuteStep={1}
                  showSecond={false}
                  disabledDate={current => current && current < moment().startOf('day')}
                />
              </Form.Item>
            )}
          </Form>
        </Col>
      </Row>
    </Modal>
  )
}

export const SchedulingAssessmentModal = connector(SchedulingAssessment)
