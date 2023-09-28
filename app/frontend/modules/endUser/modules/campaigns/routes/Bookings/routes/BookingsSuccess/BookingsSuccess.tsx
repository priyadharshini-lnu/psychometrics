import {
  useState, FC, useEffect, useRef,
} from 'react'
import _ from 'lodash'
import moment from 'moment'
import {
  Row, Typography, Col, Space, message,
} from 'antd'
import {
  google, outlook, yahoo, ics, office365, CalendarEvent,
} from 'calendar-link'
import { useParams, useHistory } from 'react-router-dom'
import { CheckCircleFilled } from '@ant-design/icons'
import cs from 'classnames'
import { connect, ConnectedProps } from 'react-redux'
import qs from 'qs'
import Tour from '@rc-component/tour'
import {
  GoogleCalendarIcon, YahooIcon, OutlookIcon, IcalIcon, Office365Icon,
} from '~/glint/icons'
import { get as getCurrentUser } from '~/core/currentUser'
import { RootState } from '~/modules/endUser/core/rootReducers'
import { isRequestInProgress } from '~/core/request'
import {
  fetchBooking as fetchSingleBooking,
  FETCH_SINGLE_BOOKING,
  SingleBooking,
  cancelBooking,
  requestCancelBooking,
  requestRescheduleBooking,
  REQUEST_RESCHEDULE_BOOKING,
  REQUEST_CANCEL_BOOKING,
  CANCEL_BOOKING,
} from '~/modules/endUser/modules/campaigns/core/bookings'
import { BookingConfirmationContainer, FullWidthSkeleton } from '~/glint'
import { RescheduleAndCancel } from './RescheduleAndCancel'
import { getLanguageNameFromCode } from '~/utils/locales'

import styles from './BookingSuccess.less'

const connector = connect(
  (state:RootState) => ({
    bookingDetailsLoading: isRequestInProgress(state, FETCH_SINGLE_BOOKING),
    currentUser: getCurrentUser(state),
    requestForRescheduleInProgress: isRequestInProgress(state, REQUEST_RESCHEDULE_BOOKING),
    requestForCancelInProgress: isRequestInProgress(state, REQUEST_CANCEL_BOOKING),
    cancelInProgress: isRequestInProgress(state, CANCEL_BOOKING),
  }),
  {
    fetchSingleBooking,
    cancelBooking,
    requestCancelBooking,
    requestRescheduleBooking,
  },
)
const { Title, Text } = Typography
const { I18n } = window

type PropsFromRedux = ConnectedProps<typeof connector>

export const BookingsSuccessComponent: FC<PropsFromRedux> = ({
  bookingDetailsLoading, fetchSingleBooking, cancelBooking, requestForRescheduleInProgress,
  requestCancelBooking, requestForCancelInProgress, cancelInProgress,
}) => {
  const tourRef = useRef<HTMLDivElement>(null)
  const queryString = qs.parse(location.search.substring(1))
  const [requestCancellation, setRequestrequestCancellation] = useState<boolean>(false)
  const [bookingDetails, setbookingDetails] = useState<null | SingleBooking >(null)
  const { inviteOrBookingId } = useParams<{ inviteOrBookingId: string }>()
  const bookedDateTime = bookingDetails?.bookedDate
  const bookedDateTimeMomentObject = bookedDateTime ? moment(bookedDateTime.date) : null
  const currentTimezone = bookingDetails?.timezone || moment.tz.guess() || 'Asia/Dubai'
  const currentTime = moment().tz(currentTimezone)
  const bookedDateTimeMomentObjectTz = bookedDateTimeMomentObject?.clone().tz(currentTimezone)
  const duration = bookingDetails?.duration || 0
  const history = useHistory()
  const bookingId = bookingDetails?.id.toString()
  const workshopId = bookingDetails?.workshopId

  const deadlineToAllowCancelByUser = bookedDateTimeMomentObjectTz?.clone()
    .subtract(bookingDetails?.cancellationLeadTime, 's')
  const bookingEndTime = bookedDateTimeMomentObjectTz?.clone().add(duration, 's')
  const meetingTime = `${bookedDateTimeMomentObjectTz?.clone().format('hh:mmA')} - ${bookingEndTime?.format('hh:mmA')}`
  const allowCancelByUser = currentTime.isSameOrBefore(deadlineToAllowCancelByUser)

  useEffect(() => {
    fetchSingleBooking(inviteOrBookingId).then(({ response }) => {
      setbookingDetails(response)
    })
  }, [])

  const event:CalendarEvent = {
    title: bookingDetails?.title || '',
    description: bookingDetails?.description || '',
    start: bookedDateTimeMomentObjectTz?.clone().format('YYYY-MM-DD HH:mm:ss ZZ'),
    duration: (duration > 0) ? [duration / 3600, 'hours'] : [0, 'hours'],
  }

  const handleCancelBooking = (cancel: boolean) => {
    if (allowCancelByUser && bookingId && workshopId) {
      cancelBooking(bookingId, workshopId).then(() => {
        message.success(I18n.t('frontend.bookings.cancellation_success'))
        history.push('/invites')
      }).catch((errors) => {
        const error = errors ? _.join(errors, ', ') : I18n.t('frontend.bookings.default_failure_msg')
        message.error(I18n.t('frontend.bookings.cancellation_failed', { error }))
      })
    } else {
      setRequestrequestCancellation(cancel)
    }
  }

  const handleRequestCancelBooking = (reason: string) => {
    if (bookingId && workshopId) {
      requestCancelBooking(bookingId, workshopId, reason).then(() => {
        message.success(I18n.t('frontend.bookings.request_cancellation_success'))
        history.push('/invites')
      })
        .catch((errors) => {
          const error = errors ? _.join(errors, ', ') : I18n.t('frontend.bookings.default_failure_msg')
          message.error(I18n.t('frontend.bookings.request_cancellation_failed', { error }))
        })
    }
  }

  const handleRescheduleBooking = () => {
    history.push(`/invites/${inviteOrBookingId}/details?type=booking`)
  }

  const headerContent = (
    <>
      <CheckCircleFilled className={cs('mb-2', styles.successIcon)} />
      <Title className="mb-0" level={4}>{I18n.t('frontend.bookings.schedule_success')}</Title>
      <Text>{I18n.t('frontend.bookings.schedule_success_msg')}</Text>
    </>
  )

  const handleAddToCalendarClick = () => {
    if (queryString.tour === 'true') {
      history.push(history.location.pathname)
    }
  }

  const detailsContent = (
    <Space size="middle" className="w-100" direction="vertical">
      <Row wrap={false}>
        <Col span={6}><Text type="secondary">{I18n.t('frontend.bookings.what')}</Text></Col>
        <Col><Text>{bookingDetails?.title}</Text></Col>
      </Row>
      <Row>
        <Col span={6}><Text type="secondary">{I18n.t('frontend.bookings.when')}</Text></Col>
        <Col>
          <Space size={6} direction="vertical">
            <Text>{bookedDateTimeMomentObjectTz?.clone().format('dddd, MMMM DD, YYYY')}</Text>
            <Text>
              {meetingTime}
              <Text type="secondary">{bookedDateTimeMomentObjectTz?.clone().format(' (z)')}</Text>
            </Text>
          </Space>
        </Col>
      </Row>
      {bookingDetails?.preferredLanguage ? (
        <Row>
          <Col span={6}><Text type="secondary">{I18n.t('frontend.bookings.language')}</Text></Col>
          <Col><Text>{getLanguageNameFromCode(bookingDetails.preferredLanguage)}</Text></Col>
        </Row>
      ) : null}
      <Row>
        <Col span={6}>
          <Text type="secondary">{I18n.t('frontend.bookings.add_to_calendar')}</Text>
        </Col>
        <div className={styles.inviteDiv} ref={tourRef}>
          <a href={google(event)} target="_blank" rel="noreferrer noopener" onClick={handleAddToCalendarClick}>
            <GoogleCalendarIcon />
          </a>
          <a href={yahoo(event)} target="_blank" rel="noreferrer noopener" onClick={handleAddToCalendarClick}>
            <YahooIcon />
          </a>
          <a href={outlook(event)} target="_blank" rel="noreferrer noopener" onClick={handleAddToCalendarClick}>
            <OutlookIcon />
          </a>
          <a href={ics(event)} target="_blank" rel="noreferrer noopener" onClick={handleAddToCalendarClick}>
            <IcalIcon />
          </a>
          <a href={office365(event)} target="_blank" rel="noreferrer noopener" onClick={handleAddToCalendarClick}>
            <Office365Icon />
          </a>
        </div>
      </Row>
      {
        queryString.tour === 'true' && (
          <Tour
            defaultCurrent={0}
            open
            steps={[
              {
                arrow: true,
                title: I18n.t('frontend.bookings.add_to_calendar'),
                description: I18n.t('frontend.bookings.add_to_calendar_tour_description'),
                target: tourRef.current,
                mask: true,
                closeIcon: true,
                placement: 'topRight',
              },
            ]}
            onClose={() => {
              history.push(history.location.pathname)
            }
            }
          />
        )
      }
    </Space>
  )

  return (
    <main className="flex items-center justify-center">
      {bookingDetailsLoading ? (
        <BookingConfirmationContainer
          headerContent={<FullWidthSkeleton active rows={2} height="30px" />}
          detailsContent={<FullWidthSkeleton active rows={4} height="30px" />}
          footerContent={<FullWidthSkeleton active rows={2} height="30px" />}
        />
      ) : (
        <BookingConfirmationContainer
          headerContent={headerContent}
          detailsContent={detailsContent}
          footerContent={(
            <RescheduleAndCancel
              cancelBooking={requestCancellation}
              onCancelBooking={handleCancelBooking}
              onRescheduleBooking={handleRescheduleBooking}
              onRequestCancellation={handleRequestCancelBooking}
              requestForRescheduleInProgress={requestForRescheduleInProgress}
              requestForCancelInProgress={requestForCancelInProgress}
              allowCancelByUser={allowCancelByUser}
              cancelInProgress={cancelInProgress}
            />
          )}
        />
      )}
    </main>
  )
}

export const BookingsSuccess = connector(BookingsSuccessComponent)
