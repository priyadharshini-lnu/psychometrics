import { FC } from 'react'
import {
  Form, Space, Button, Input,
} from 'antd'

import { DirectionalArrowIcon } from '~/glint'

const { I18n } = window

type Props = {
  cancelBooking: boolean
  rescheduleBooking: boolean
  onCancelBooking: (cancel: boolean) => void
  onRescheduleBooking: (reschedule: boolean) => void
  onRequestCancellation: (reason: string) => void
  onRequestRescheduleBooking: (reason: string) => void
  requestForCancelInProgress: boolean
  requestForRescheduleInProgress: boolean
}
export const RescheduleAndCancel: FC<Props> = ({
  cancelBooking, onCancelBooking, onRescheduleBooking, requestForRescheduleInProgress, requestForCancelInProgress,
  onRequestCancellation, rescheduleBooking, onRequestRescheduleBooking,
}) => {
  const [requestCancelOrRescheduleForm] = Form.useForm()
  const requestButtonText = cancelBooking ? I18n.t('bookings.buttons.request_cancel')
    : I18n.t('bookings.buttons.request_reschedule')
  const requestHandler = cancelBooking ? onRequestCancellation : onRequestRescheduleBooking
  const reasonLabel = cancelBooking ? I18n.t('bookings.reason_for_cancel') : I18n.t('bookings.reason_for_reschedule')

  if (cancelBooking || rescheduleBooking) {
    return (
      <>
        <label className="block" htmlFor="reason">{reasonLabel}</label>
        <Form
          form={requestCancelOrRescheduleForm}
          onFinish={(values) => {
            requestHandler(values.reason)
          }}
        >
          <Form.Item name="reason" rules={[{ required: true }]}><Input.TextArea rows={3} /></Form.Item>
        </Form>
        <div className="ta-e">
          <Space>
            <Button
              size="small"
              onClick={() => {
                onCancelBooking(false)
                onRescheduleBooking(false)
              }}
            >
              {I18n.t('bookings.buttons.nevermind')}
            </Button>

            <Button
              loading={requestForRescheduleInProgress || requestForCancelInProgress}
              size="small"
              type="primary"
              onClick={() => requestCancelOrRescheduleForm.submit()}
            >
              {requestButtonText}
              {' '}
              <DirectionalArrowIcon />
            </Button>
          </Space>
        </div>
      </>
    )
  }
  return (
    <>
      <Space size={2}>
        <span>{I18n.t('bookings.need_changes')}</span>
        <Button className="ps-2 pe-2" type="link" onClick={() => onCancelBooking(true)}>
          {I18n.t('bookings.buttons.cancel_booking')}
        </Button>
        <span>{I18n.t('bookings.or')}</span>
        <Button className="ps-2 pe-2" type="link" onClick={() => onRescheduleBooking(true)}>
          {I18n.t('bookings.buttons.reschedule')}
        </Button>
      </Space>
    </>
  )
}
