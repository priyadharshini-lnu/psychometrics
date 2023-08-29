import {
  FC, useState, useEffect, useRef,
} from 'react'
import {
  Col, Layout, Form, message,
} from 'antd'
import moment, { Moment } from 'moment-timezone'
import { connect, ConnectedProps } from 'react-redux'
import { useParams, useLocation, useHistory } from 'react-router-dom'
import cs from 'classnames'
import qs from 'qs'

import { Store } from 'antd/lib/form/interface'
import { get as getCurrentUser } from '~/core/currentUser'
import {
  bookSlot, SingleInvite, SingleBooking, fetchBooking, fetchInvite, rescheduleBooking,
} from '~/modules/endUser/modules/campaigns/core/bookings'
import { Questionnaire } from './Questionnaire'
import { BookingCard, ButtonWithArrow, FullWidthSkeleton } from '~/glint'
import { RootState } from '~/modules/admin/core/rootReducers'
import { BookingConfirm } from './BookingsConfirm'

import styles from './BookingsAndInvitesDetails.less'

const { I18n } = window

const connector = connect((state: RootState) => ({
  currentUser: getCurrentUser(state),
}), {
  bookSlot,
  fetchBooking,
  fetchInvite,
  rescheduleBooking,
})

type TimeSlot = {
  id: number,
  date: Moment
}
type PropsFromRedux = ConnectedProps<typeof connector>
type Props = PropsFromRedux

const BookingsAndInvitesDetailsComponet:FC<Props> = ({
  currentUser, bookSlot, fetchInvite, fetchBooking, rescheduleBooking,
}) => {
  const [inviteOrBookingDetails, setInviteOrBookingDetails] = useState<null | SingleInvite | SingleBooking>(null)
  const bookedDateMomentObject = (
    inviteOrBookingDetails && 'bookedDate' in inviteOrBookingDetails && inviteOrBookingDetails.bookedDate
  ) ? { id: inviteOrBookingDetails.bookedDate.id, date: moment(inviteOrBookingDetails.bookedDate.date) } : null
  const [selectedDateTime, setSelectedDateTime] = useState<TimeSlot | null>(bookedDateMomentObject)
  const [book, setBook] = useState(false)
  const [questionForm] = Form.useForm()
  const history = useHistory()
  const { inviteOrBookingId } = useParams<{ inviteOrBookingId: string }>()
  const location = useLocation()
  const questionResponseValueRef = useRef<Store>({})

  const { type } = qs.parse(location.search.substr(1))

  const preferredLanguageFromData = inviteOrBookingDetails
    && 'preferredLanguage' in inviteOrBookingDetails && inviteOrBookingDetails.preferredLanguage
  const neurodivergentCommentsFromData = inviteOrBookingDetails
    && 'neurodivergentComments' in inviteOrBookingDetails && inviteOrBookingDetails.neurodivergentComments
  const neurodivergentFromData = inviteOrBookingDetails
    && 'neurodivergent' in inviteOrBookingDetails && inviteOrBookingDetails.neurodivergentComments
  const initialQuestionAnswers = {
    language: !!preferredLanguageFromData,
    preferredLanguage: preferredLanguageFromData,
    neurodivergent: !!neurodivergentFromData,
    neurodivergentComments: neurodivergentCommentsFromData || '',
  }

  const availableDates = inviteOrBookingDetails
    ? inviteOrBookingDetails.availableDates.map(dateObj => ({ id: dateObj.id, date: moment(dateObj.date) })) : []

  const selectedDateId = selectedDateTime?.id

  const { neurodivergent, neurodivergentComments, preferredLanguage } = questionResponseValueRef.current

  useEffect(() => {
    if (type === 'invite') {
      fetchInvite(inviteOrBookingId).then(({ response }) => {
        setInviteOrBookingDetails(response)
      })
    }
    if (type === 'booking') {
      fetchBooking(inviteOrBookingId).then(({ response }) => {
        setInviteOrBookingDetails(response)
      })
    }
  }, [])

  const handleBook = () => {
    setBook(true)
    questionResponseValueRef.current = questionForm.getFieldsValue()
    questionForm.resetFields()
  }

  const handleAssessmentCenterBooking = () => {
    const bookingData = {
      workshopSubjectDetails: { neurodivergent, neurodivergentComments, preferredLanguage },
      id: inviteOrBookingDetails?.id,
      workshopId: selectedDateId,
      userId: currentUser.id,
    }
    if (inviteOrBookingDetails?.id) {
      bookSlot(inviteOrBookingDetails.id.toString(), bookingData).then(() => {
        history.push(`/invites/${inviteOrBookingId}/success`)
      }).catch(() => message.error(I18n.t('frontend.bookings.booking_failed_msg')))
    }
  }

  const handleAssessmentCenterRescheduling = () => {
    const rescheduleData = {
      workshopSubjectDetails: { neurodivergent, neurodivergentComments, preferredLanguage },
      id: inviteOrBookingDetails?.id,
      workshopId: bookedDateMomentObject?.id as number,
      status: 'rescheduled',
      newWorkshopBookingId: selectedDateId as number,
    }
    if (inviteOrBookingDetails?.id) {
      rescheduleBooking(inviteOrBookingDetails.id.toString(), rescheduleData).then(() => {
        history.push(`/invites/${inviteOrBookingId}/success`)
      }).catch(() => message.error(I18n.t('frontend.bookings.reschedule_failed_msg')))
    }
  }

  return (
    <Layout.Content className={styles.pageContent}>
      {book && selectedDateTime && inviteOrBookingDetails
        ? (
          <BookingConfirm
            onCancelOfConfirmBooking={() => setBook(false)}
            bookingDateTime={selectedDateTime.date}
            language={questionForm.getFieldValue('language') ? questionForm.getFieldValue('preferredLanguage') : ''}
            bookingTimeZone={inviteOrBookingDetails.timezone || moment.tz.guess()}
            duration={inviteOrBookingDetails.duration || 0}
            title={inviteOrBookingDetails.title || ''}
            onConfirmBooking={() => {
              type === 'invite' && handleAssessmentCenterBooking()
              type === 'booking' && handleAssessmentCenterRescheduling()
            }
            }
          />
        ) : (
          <Col
            className={cs('mb-6', 'mt-6', styles.column, { [styles.narrowColumn]: !selectedDateTime })}
            xs={24}
            sm={24}
            md={24}
            lg={24}
            xl={22}
            xxl={18}
          >
            {!inviteOrBookingDetails ? <FullWidthSkeleton height="400px" rows={1} active /> : (
              <>
                <BookingCard
                  currentDateTime={selectedDateTime?.date || null}
                  title={inviteOrBookingDetails.title}
                  description={inviteOrBookingDetails.description}
                  availableDateTimes={availableDates}
                  onDateTimeSelection={setSelectedDateTime}
                  bookingTimeZone={inviteOrBookingDetails?.timezone}
                  questionnaireComponent={(
                    <Questionnaire
                      formInstance={questionForm}
                      allowNeurodiversity={inviteOrBookingDetails.allowNeurodiversityOption}
                      allowLanguagePreference={inviteOrBookingDetails.allowLanguagePreference}
                      allowedLanguages={inviteOrBookingDetails.allowedLanguages}
                      initialValues={initialQuestionAnswers}
                    />
                  )}
                />
                {selectedDateTime
                  && (
                  <div className="flex mt-6 justify-end">
                    <ButtonWithArrow label="Book" type="primary" onClick={handleBook} />
                  </div>
                  )}
              </>
            )}
          </Col>
        )
        }
    </Layout.Content>
  )
}

export const BookingsAndInvitesDetails = connector(BookingsAndInvitesDetailsComponet)
