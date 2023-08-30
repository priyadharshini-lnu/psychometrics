import { FC } from 'react'
import { Moment } from 'moment'
import {
  Row, Typography, Col, Space, Button,
} from 'antd'
import { connect, ConnectedProps } from 'react-redux'

import { isRequestInProgress } from '~/core/request'
import { BOOK_SLOT, RESCHEDULE_BOOKING } from '~/modules/endUser/modules/campaigns/core/bookings'
import { RootState } from '~/modules/admin/core/rootReducers'
import { BookingConfirmationContainer, DirectionalArrowIcon } from '~/glint'
import { getLanguageNameFromCode } from '~/utils/locales'

const { I18n } = window
const { Title, Text } = Typography
type BookingConfirmProps = {
  bookingDateTime: Moment
  language: string
  duration: number
  onCancelOfConfirmBooking: ()=> void
  onConfirmBooking: ()=> void
  bookingTimeZone: string
  title: string
}

const connector = connect((state: RootState) => ({
  isBookingInProgress: isRequestInProgress(state, BOOK_SLOT),
  isRescheduleInProgress: isRequestInProgress(state, RESCHEDULE_BOOKING),
}), {})

type PropsFromRedux = ConnectedProps<typeof connector>
type Props = BookingConfirmProps & PropsFromRedux

const BookingConfirmComponent: FC<Props> = ({
  bookingDateTime, language, duration, onCancelOfConfirmBooking, bookingTimeZone, onConfirmBooking, title,
  isBookingInProgress, isRescheduleInProgress,
}) => {
  const bookingEndTime = bookingDateTime.clone().add(duration, 's')
  const meetingTime = `${bookingDateTime.clone().format('hh:mmA')} - ${bookingEndTime.format('hh:mmA')}`
  const loading = isBookingInProgress || isRescheduleInProgress

  const headerContent = (
    <>
      <Title level={4}>{I18n.t('frontend.bookings.confirm_booking_title')}</Title>
      <Text>{I18n.t('frontend.bookings.confirm_booking_description')}</Text>
    </>
  )

  const detailsContent = (
    <Space size="middle" className="w-100" direction="vertical">
      <Row wrap={false}>
        <Col span={6}><Text type="secondary">{I18n.t('frontend.bookings.what')}</Text></Col>
        <Col><Text>{title}</Text></Col>
      </Row>
      <Row>
        <Col span={6}><Text type="secondary">{I18n.t('frontend.bookings.when')}</Text></Col>
        <Col>
          <Space size={6} direction="vertical">
            <Text>{bookingDateTime.clone().format('dddd, MMMM DD, YYYY')}</Text>
            <Text>
              {meetingTime}
              <Text type="secondary">{bookingDateTime.clone().tz(bookingTimeZone).format(' (z)')}</Text>
            </Text>
          </Space>
        </Col>
      </Row>
      {language ? (
        <Row>
          <Col span={6}><Text type="secondary">{I18n.t('frontend.bookings.language')}</Text></Col>
          <Col><Text>{getLanguageNameFromCode(language)}</Text></Col>
        </Row>
      ) : null}
    </Space>
  )

  const footerContent = (
    <div className="ta-e">
      <Space>
        <Button
          disabled={loading}
          onClick={onCancelOfConfirmBooking}
        >
          {I18n.t('frontend.bookings.buttons.cancel')}
        </Button>
        <Button
          type="primary"
          onClick={onConfirmBooking}
          loading={loading}
        >
          {I18n.t('frontend.bookings.buttons.confirm_booking')}
          {' '}
          <DirectionalArrowIcon />
        </Button>
      </Space>
    </div>
  )

  return (
    <BookingConfirmationContainer
      headerContent={headerContent}
      detailsContent={detailsContent}
      footerContent={footerContent}
    />
  )
}

export const BookingConfirm = connector(BookingConfirmComponent)
