import { FC } from 'react'
import { Moment } from 'moment'
import {
  Row, Typography, Col, Space, Button,
} from 'antd'

import { BookingConfirmationContainer, DirectionalArrowIcon } from '~/glint'

const { I18n } = window
const { Title, Text } = Typography
type Props = {
  bookingDateTime: Moment
  language: string
  duration: number
  onCancelOfConfirmBooking: ()=> void
  onConfirmBooking: ()=> void
  bookingTimeZone: string
  title: string
}

export const BookingConfirm: FC<Props> = ({
  bookingDateTime, language, duration, onCancelOfConfirmBooking, bookingTimeZone, onConfirmBooking, title,
}) => {
  const bookingEndTime = bookingDateTime.clone().add(duration, 's')
  const meetingTime = `${bookingDateTime.clone().format('hh:mmA')} - ${bookingEndTime.format('hh:mmA')}`

  const headerContent = (
    <>
      <Title level={4}>{I18n.t('bookings.confirm_booking_title')}</Title>
      <Text>{I18n.t('bookings.confirm_booking_description')}</Text>
    </>
  )

  const detailsContent = (
    <Space size="middle" className="w-100" direction="vertical">
      <Row wrap={false}>
        <Col span={6}><Text type="secondary">{I18n.t('bookings.what')}</Text></Col>
        <Col><Text>{title}</Text></Col>
      </Row>
      <Row>
        <Col span={6}><Text type="secondary">{I18n.t('bookings.when')}</Text></Col>
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
          <Col span={6}><Text type="secondary">{I18n.t('bookings.language')}</Text></Col>
          <Col><Text>{language}</Text></Col>
        </Row>
      ) : null}
    </Space>
  )

  const footerContent = (
    <div className="ta-e">
      <Space>
        <Button onClick={onCancelOfConfirmBooking}>{I18n.t('bookings.buttons.cancel')}</Button>
        <Button
          type="primary"
          onClick={onConfirmBooking}
        >
          {I18n.t('bookings.buttons.confirm_booking')}
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
