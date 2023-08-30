import { FC, useEffect, useState } from 'react'
import {
  Form, Space, Button, Input, Popconfirm, PopconfirmProps,
} from 'antd'

import { DirectionalArrowIcon } from '~/glint'

const { I18n } = window

type Props = {
  cancelBooking: boolean
  onCancelBooking: (cancel: boolean) => void
  onRescheduleBooking: () => void
  onRequestCancellation: (reason: string) => void
  requestForCancelInProgress: boolean
  requestForRescheduleInProgress: boolean
  allowCancelByUser: boolean
  cancelInProgress: boolean
}
export const RescheduleAndCancel: FC<Props> = ({
  cancelBooking, onCancelBooking, onRescheduleBooking, requestForRescheduleInProgress, requestForCancelInProgress,
  onRequestCancellation, allowCancelByUser, cancelInProgress,
}) => {
  const [openConfirmPopup, setOpenConfirmPopup] = useState(false)
  const [requestCancelForm] = Form.useForm()
  const requestButtonText = cancelBooking ? I18n.t('frontend.bookings.buttons.request_cancel')
    : I18n.t('frontend.bookings.buttons.request_reschedule')
  const reasonLabel = cancelBooking
    ? I18n.t('frontend.bookings.reason_for_cancel') : I18n.t('frontend.bookings.reason_for_reschedule')

  useEffect(() => {
    if (!cancelInProgress && openConfirmPopup) {
      setOpenConfirmPopup(false)
    }
  }, [cancelInProgress])

  if (cancelBooking) {
    return (
      <>
        <label className="block" htmlFor="reason">{reasonLabel}</label>
        <Form
          form={requestCancelForm}
          onFinish={(values) => {
            onRequestCancellation(values.reason)
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
              }}
            >
              {I18n.t('frontend.bookings.buttons.nevermind')}
            </Button>

            <Button
              loading={requestForRescheduleInProgress || requestForCancelInProgress}
              size="small"
              type="primary"
              onClick={() => requestCancelForm.submit()}
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
        <span>{I18n.t('frontend.bookings.need_changes')}</span>
        <CancelButtonWrapper
          allowCancelByUser={allowCancelByUser}
          cancelInProgress={cancelInProgress}
          onConfirm={() => onCancelBooking(true)}
          open={openConfirmPopup}
          onCancel={() => setOpenConfirmPopup(false)}
        >
          <Button
            onClick={() => {
              allowCancelByUser ? setOpenConfirmPopup(true) : onCancelBooking(true)
            }}
            className="ps-2 pe-2"
            type="link"
          >
            {I18n.t('frontend.bookings.buttons.cancel_booking')}
          </Button>
        </CancelButtonWrapper>
        <span>{I18n.t('frontend.bookings.or')}</span>
        <Button className="ps-2 pe-2" type="link" onClick={() => onRescheduleBooking()}>
          {I18n.t('frontend.bookings.buttons.reschedule')}
        </Button>
      </Space>
    </>
  )
}

type CancelButtonWrapperProps = Omit<PopconfirmProps, 'title'|'okText'|'cancelText'> & {
  allowCancelByUser: boolean
  cancelInProgress: boolean
}
const CancelButtonWrapper:FC<CancelButtonWrapperProps> = ({
  allowCancelByUser, children, cancelInProgress, onConfirm, open, onCancel,
}) => (
  allowCancelByUser ? (
    <Popconfirm
      title={I18n.t('frontend.bookings.cancel_booking_confirmation')}
      okButtonProps={{ loading: cancelInProgress }}
      cancelButtonProps={{ disabled: cancelInProgress }}
      onConfirm={onConfirm}
      onCancel={onCancel}
      open={open}
      okText={I18n.t('frontend.bookings.buttons.yes_text')}
      cancelText={I18n.t('frontend.bookings.buttons.no_text')}
    >
      {children}
    </Popconfirm>
  ) : <>{children}</>
)
