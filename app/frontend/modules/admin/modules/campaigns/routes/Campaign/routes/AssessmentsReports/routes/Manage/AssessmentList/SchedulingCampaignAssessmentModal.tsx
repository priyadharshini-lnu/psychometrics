import React from 'react'
import {
  Modal, Form, Button, DatePicker, Checkbox, Row, Col, message,
} from 'antd'
import { ConnectedProps, connect } from 'react-redux'
import moment from 'moment'
import Assessment from '~/modules/admin/modules/campaigns/interfaces/Assessment'
import { scheduleAssessment, SCHEDULE_ASSESSMENT } from '~/modules/admin/modules/campaigns/core/assessments/actions'
import { isRequestInProgress } from '~/core/request'
import { RootState } from '~/modules/admin/core/rootReducers'

const { I18n } = window

interface OwnProps {
  close(): void
  campaignId: number
  assessment: Assessment
}

const connector = connect(
  (state: RootState) => ({
    scheduleAssessmentInProgress: isRequestInProgress(state, SCHEDULE_ASSESSMENT),
  }),
  { scheduleAssessment },
)

type PropsFromRedux = ConnectedProps<typeof connector>
type Props = PropsFromRedux & OwnProps

export const SchedulingCampaignAssessment: React.FC<Props> = ({
  close, campaignId, assessment, scheduleAssessment, scheduleAssessmentInProgress,
}) => {
  const [form] = Form.useForm()
  const unscheduled = Form.useWatch('unschedule', form)

  const schedule = () => {
    const data = {
      ...form.getFieldsValue(),
      scheduleTime: unscheduled ? null : form.getFieldValue('scheduleTime')?.toDate(),
    }
    scheduleAssessment(campaignId, assessment.id, data).then(() => {
      message.success(I18n.t('campaign_assessment.scheduled_successfully'))
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
          <Button
            type="primary"
            onClick={schedule}
            loading={scheduleAssessmentInProgress}
            disabled={scheduleAssessmentInProgress}
          >
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
            }}
          >
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
