import {
  useState, FC, useEffect, useRef,
} from 'react'
import _ from 'lodash'
import {
  Row, Typography, Col, Space, App, Tour,
} from 'antd'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import cs from 'classnames'
import { connect, ConnectedProps } from 'react-redux'
import { CheckCircleFilled } from '~/glint/icons/AccessibleIconsAntDesign'
import dayjs from '~/utils/dayjs'
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
import { normalizeTimeZone } from '~/hooks/useTimezones'

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
  const { message } = App.useApp()
  const tourRef = useRef<HTMLDivElement>(null)
  const [searchParams, setSearchParams] = useSearchParams()
  const [requestCancellation, setRequestrequestCancellation] = useState<boolean>(false)
  const [bookingDetails, setbookingDetails] = useState<null | SingleBooking >(null)
  const { inviteOrBookingId } = useParams() as { inviteOrBookingId: string }
  const bookedDateTime = bookingDetails?.bookedDate
  const bookedDateTimeMomentObject = bookedDateTime ? dayjs(bookedDateTime.date) : null
  const currentTimezone = bookingDetails?.timezone || normalizeTimeZone(dayjs.tz.guess())
  const currentTime = dayjs().tz(currentTimezone)
  const bookedDateTimeMomentObjectTz = bookedDateTimeMomentObject?.clone().tz(currentTimezone)
  const duration = bookingDetails?.duration || 0
  const navigate = useNavigate()
  const bookingId = bookingDetails?.id.toString()
  const workshopId = bookingDetails?.workshopId

  const deadlineToAllowCancelByUser = bookedDateTimeMomentObjectTz?.clone()
    .subtract(bookingDetails?.cancellationLeadTime || 0, 's')
  const deadlineToAllowRescheduleByUser = bookedDateTimeMomentObjectTz?.clone()
    .subtract(bookingDetails?.schedulingLeadTime || 0, 's')
  const bookingEndTime = bookedDateTimeMomentObjectTz?.clone().add(duration, 's')
  const meetingTime = `${bookedDateTimeMomentObjectTz?.clone().format('hh:mmA')} - ${bookingEndTime?.format('hh:mmA')}`
  const allowCancelByUser = !!deadlineToAllowCancelByUser && currentTime.isSameOrBefore(deadlineToAllowCancelByUser)
  const allowRescheduleByUser = !!deadlineToAllowRescheduleByUser
  && currentTime.isSameOrBefore(deadlineToAllowRescheduleByUser)
  const disableCancelAndReschedule = bookingDetails?.disableCancellationAndRescheduling

  useEffect(() => {
    fetchSingleBooking(inviteOrBookingId).then(({ response }) => {
      setbookingDetails(response)
    })
  }, [])

  const handleCancelBooking = (cancel: boolean) => {
    if (allowCancelByUser && bookingId && workshopId) {
      cancelBooking(bookingId, workshopId).then(() => {
        message.success(I18n.t('frontend.bookings.cancellation_success'))
        navigate('/invites')
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
        navigate('/invites')
      })
        .catch((errors) => {
          const error = errors ? _.join(errors, ', ') : I18n.t('frontend.bookings.default_failure_msg')
          message.error(I18n.t('frontend.bookings.request_cancellation_failed', { error }))
        })
    }
  }

  const handleRescheduleBooking = () => {
    navigate(`/invites/${inviteOrBookingId}/details?type=booking`)
  }

  const headerContent = (
    <>
      <CheckCircleFilled className={cs('mb-2', styles.successIcon)} />
      <Title className="mb-0" level={4}>{I18n.t('frontend.bookings.schedule_success')}</Title>
      <Text>{I18n.t('frontend.bookings.schedule_success_msg')}</Text>
    </>
  )

  const handleAddToCalendarClick = () => {
    if (searchParams.get('tour') === 'true') {
      const newSearchParams = new URLSearchParams(searchParams)
      newSearchParams.delete('tour')
      setSearchParams(newSearchParams, { replace: true })
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
          <a
            aria-label={I18n.t('frontend.bookings.add_to_google_calendar')}
            href={downloadIcalUrl(inviteOrBookingId, workshopId)}
            target="_blank"
            rel="noreferrer noopener"
            onClick={handleAddToCalendarClick}
          >
            <GoogleCalendarIcon />
          </a>
          <a
            aria-label={I18n.t('frontend.bookings.add_to_yahoo_calendar')}
            href={downloadIcalUrl(inviteOrBookingId, workshopId)}
            target="_blank"
            rel="noreferrer noopener"
            onClick={handleAddToCalendarClick}
          >
            <YahooIcon />
          </a>
          <a
            aria-label={I18n.t('frontend.bookings.add_to_outlook_calendar')}
            href={downloadIcalUrl(inviteOrBookingId, workshopId)}
            target="_blank"
            rel="noreferrer noopener"
            onClick={handleAddToCalendarClick}
          >
            <OutlookIcon />
          </a>
          <a
            aria-label={I18n.t('frontend.bookings.add_to_i_calendar')}
            href={downloadIcalUrl(inviteOrBookingId, workshopId)}
            target="_blank"
            rel="noreferrer noopener"
            onClick={handleAddToCalendarClick}
          >
            <IcalIcon />
          </a>
          <a
            aria-label={I18n.t('frontend.bookings.add_to_msoffice_calendar')}
            href={downloadIcalUrl(inviteOrBookingId, workshopId)}
            target="_blank"
            rel="noreferrer noopener"
            onClick={handleAddToCalendarClick}
          >
            <Office365Icon />
          </a>
        </div>
      </Row>
      {
       searchParams.get('tour') === 'true' && (
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
             const newSearchParams = new URLSearchParams(searchParams)
             newSearchParams.delete('tour')
             setSearchParams(newSearchParams, { replace: true })
           }
            }
         />
       )
      }
    </Space>
  )

  const footerContent = (
    !!disableCancelAndReschedule
     && !allowRescheduleByUser
     && !allowCancelByUser
     && !bookingDetails?.allowLateCancellationAndRescheduling)
    ? null : (
      <RescheduleAndCancel
        cancelBooking={requestCancellation}
        onCancelBooking={handleCancelBooking}
        onRescheduleBooking={handleRescheduleBooking}
        onRequestCancellation={handleRequestCancelBooking}
        requestForRescheduleInProgress={requestForRescheduleInProgress}
        requestForCancelInProgress={requestForCancelInProgress}
        allowCancelByUser={allowCancelByUser}
        cancelInProgress={cancelInProgress}
        allowLateCancellationAndRescheduling={bookingDetails?.allowLateCancellationAndRescheduling || false}
        allowRescheduleByUser={allowRescheduleByUser}
        disableCancelAndReschedule={!!disableCancelAndReschedule}
      />
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
          footerContent={footerContent}
        />
      )}
    </main>
  )
}

export const BookingsSuccess = connector(BookingsSuccessComponent)

export const downloadIcalUrl = (
  inviteId?: string | number | null,
  workshopId?: string | number | null,
): string | undefined => {
  if (inviteId == null || workshopId == null) return undefined

  return `/workshop_invites/${inviteId}/download_ical?workshop_id=${workshopId}`
}
