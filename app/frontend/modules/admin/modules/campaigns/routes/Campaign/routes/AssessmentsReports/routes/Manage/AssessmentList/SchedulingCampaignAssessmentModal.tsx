import React from 'react'
import {
  Modal, Form, Button, DatePicker, Checkbox, Row, Col,
} from 'antd'
import { connect } from 'react-redux'
import moment from 'moment'
import Assessment from '~/modules/admin/modules/campaigns/interfaces/Assessment'
import { scheduleAssessment } from '~/modules/admin/modules/campaigns/core/assessments/actions'

interface Props {
  close(): void
  campaignId: number
  assessment: Assessment
  scheduleAssessment: (campaignId: number, assessmentId: number, data: object) => Promise<{response}>
}

const { I18n } = window

const connector = connect(null, { scheduleAssessment })

export const SchedulingCampaignAssessment: React.FC<Props> = ({
  close, campaignId, assessment, scheduleAssessment,
}) => {
  const [form] = Form.useForm()
  const unscheduled = Form.useWatch('unschedule', form)
  const requireScheduling = Form.useWatch('requireScheduling', form)
  const hasScheduleTime = requireScheduling && !unscheduled

  const schedule = () => {
    const data = {
      ...form.getFieldsValue(),
      scheduleTime: hasScheduleTime ? form.getFieldValue('scheduleTime')?.toDate() : null,
    }
    scheduleAssessment(campaignId, assessment.id, data).then(() => {
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
          <Form
            form={form}
            initialValues={{
              scheduleTime: moment(),
              overrideExisting: false,
              requireScheduling: true,
            }}
          >
            <Form.Item name="requireScheduling" valuePropName="checked">
              <Checkbox>
                {I18n.t('common.column.require_scheduling')}
              </Checkbox>
            </Form.Item>
            {hasScheduleTime && (
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
            <Form.Item name="unschedule" valuePropName="checked">
              <Checkbox>
                {I18n.t('common.column.unschedule')}
              </Checkbox>
            </Form.Item>
            <Form.Item name="overrideExisting" valuePropName="checked">
              <Checkbox>
                {I18n.t('campaign_assessment.scheduling.update_exists')}
              </Checkbox>
            </Form.Item>
          </Form>
        </Col>
      </Row>
    </Modal>
  )
}

export const SchedulingCampaignAssessmentModal = connector(SchedulingCampaignAssessment)
