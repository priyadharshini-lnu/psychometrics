import {
  FC, useEffect, useState, useRef,
} from 'react'
import {
  Form, Space, Button, Input, Popconfirm,
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
  allowRescheduleByUser: boolean,
  cancelInProgress: boolean
  allowLateCancellationAndRescheduling: boolean
}
export const RescheduleAndCancel: FC<Props> = ({
  cancelBooking, onCancelBooking, onRescheduleBooking, requestForRescheduleInProgress, requestForCancelInProgress,
  onRequestCancellation, allowCancelByUser, cancelInProgress, allowRescheduleByUser,
  allowLateCancellationAndRescheduling,
}) => {
  const [openConfirmPopup, setOpenConfirmPopup] = useState(false)
  const [requestCancelForm] = Form.useForm()
  const cancelConfirmRef = useRef<HTMLElement|null>(null)
  const requestButtonText = cancelBooking ? I18n.t('frontend.bookings.buttons.request_cancel')
    : I18n.t('frontend.bookings.buttons.request_reschedule')
  const reasonLabel = cancelBooking
    ? I18n.t('frontend.bookings.reason_for_cancel') : I18n.t('frontend.bookings.reason_for_reschedule')

  useEffect(() => {
    if (!cancelInProgress && openConfirmPopup) {
      setOpenConfirmPopup(false)
    }
  }, [cancelInProgress])

  useEffect(() => {
    if (openConfirmPopup) {
      const confirmCancelBtn = cancelConfirmRef.current?.querySelector(
        '.ant-popconfirm-buttons button',
      ) as HTMLButtonElement
      confirmCancelBtn?.focus()
    }
  }, [openConfirmPopup])

  const cancelBtn = (
    <Button
      onClick={() => {
        allowCancelByUser ? setOpenConfirmPopup(true) : onCancelBooking(true)
      }}
      className="ps-2 pe-2"
      type="link"
    >
      {I18n.t('frontend.bookings.buttons.cancel_booking')}
    </Button>
  )


  if (cancelBooking) {
    return (
      <>
        <label className="block" htmlFor="reason">{reasonLabel}</label>
        <Form form={requestCancelForm} onFinish={(values) => { onRequestCancellation(values.reason) }}>
          <Form.Item name="reason" rules={[{ required: true }]}><Input.TextArea rows={3} /></Form.Item>
        </Form>
        <div className="ta-e">
          <Space>
            <Button size="small" onClick={() => { onCancelBooking(false) }}>
              {I18n.t('frontend.bookings.buttons.nevermind')}
            </Button>
            <Button
              loading={requestForRescheduleInProgress || requestForCancelInProgress}
              size="small"
              type="primary"
              onClick={() => requestCancelForm.submit()}
            >
              {`${requestButtonText} `}
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
        {allowCancelByUser ? (
          <Popconfirm
            destroyTooltipOnHide
            title={I18n.t('frontend.bookings.cancel_booking_confirmation')}
            okButtonProps={{
              loading: cancelInProgress,
              'aria-description': I18n.t('frontend.bookings.cancel_booking_confirmation'),
            }}
            cancelButtonProps={{
              disabled: cancelInProgress,
              'aria-description': I18n.t('frontend.bookings.cancel_booking_confirmation'),
            }}
            onConfirm={() => onCancelBooking(true)}
            onCancel={() => setOpenConfirmPopup(false)}
            open={openConfirmPopup}
            okText={I18n.t('frontend.bookings.buttons.yes_text')}
            cancelText={I18n.t('frontend.bookings.buttons.no_text')}
            getPopupContainer={(trigger) => {
              cancelConfirmRef.current = trigger.parentElement
              return trigger.parentElement || document.body
            }}
          >
            {cancelBtn}
          </Popconfirm>
        ) : null}
        {!allowCancelByUser && allowLateCancellationAndRescheduling ? cancelBtn : null}
        {(allowCancelByUser && allowRescheduleByUser && !allowLateCancellationAndRescheduling)
        || (allowLateCancellationAndRescheduling)
          ? <span>{I18n.t('frontend.bookings.or')}</span>
          : null}
        {(!allowRescheduleByUser && allowLateCancellationAndRescheduling) || allowRescheduleByUser ? (
          <Button className="ps-2 pe-2" type="link" onClick={() => onRescheduleBooking()}>
            {I18n.t('frontend.bookings.buttons.reschedule')}
          </Button>
        ) : null}
      </Space>
    </>
  )
}
