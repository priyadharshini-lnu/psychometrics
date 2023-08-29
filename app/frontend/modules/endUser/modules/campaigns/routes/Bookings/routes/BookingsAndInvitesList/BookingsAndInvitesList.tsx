import { FC, useEffect, useState } from 'react'
import _ from 'lodash'
import {
  Tabs, Row, Col, Space, Typography, Skeleton, Layout,
} from 'antd'
import { CalendarOutlined } from '@ant-design/icons'
import { connect, ConnectedProps } from 'react-redux'
import { useHistory, useLocation } from 'react-router-dom'
import moment from 'moment-timezone'

import { DetailsCard, FullWidthSkeleton } from '~/glint'
import { TimerText } from '~/modules/endUser/modules/campaigns/components/TimerText'
import {
  fetchBookings, fetchInvites, Booking, Invite, FETCH_BOOKINGS, FETCH_INVITES,
} from '~/modules/endUser/modules/campaigns/core/bookings'
import { StatusText } from '~/modules/endUser/modules/campaigns/components/StatusText'
import { RootState } from '~/modules/endUser/core/rootReducers'
import { isRequestInProgress } from '~/core/request'
import styles from './BookingsAndInvitesList.less'
import { secondsToDayHoursAndMinutes } from '~/utils/time'

const connector = connect(
  (state:RootState) => ({
    bookingsLoading: isRequestInProgress(state, FETCH_BOOKINGS),
    invitesLoading: isRequestInProgress(state, FETCH_INVITES),
  }),
  {
    fetchBookings,
    fetchInvites,
  },
)

type PropsFromRedux = ConnectedProps<typeof connector>

const { I18n } = window
const { Text, Title } = Typography
const SKELETON_ROW_HEIGHT = '20vh'
export const SKELETON_ROWS = 4

const MODIFY_FOR_STATUSES = [
  'accepted', 'rescheduled',
]

const SHOW_STATUSES = [
  'cancelled', 'requested_cancellation', 'requested_rescheduling',
]

export const BookingsAndInvitesListComponent:FC<PropsFromRedux> = ({
  fetchBookings, fetchInvites, bookingsLoading, invitesLoading,
}) => {
  const [invites, setInvites] = useState<Invite[]|[]>([])
  const [bookings, setBookings] = useState<Booking[] | []>([])
  const history = useHistory()
  const location = useLocation()

  const handleClickInvite = (id: number) => {
    history.push(`${location.pathname}/${id}/details?type=invite`)
  }
  const handleClickBooking = (id: number) => {
    history.push(`${location.pathname}/${id}/success`)
  }
  const tabItems = [
    {
      label: <TabLabel
        title={I18n.t('frontend.bookings.tab_label.invites')}
        count={invites ? invites.length : 0}
        loading={invitesLoading}
      />,
      key: 'invites',
      children: <InvitesList onClickInvite={handleClickInvite} invites={invites} loading={invitesLoading} />,
    },
    {
      label: <TabLabel
        title={I18n.t('frontend.bookings.tab_label.bookings')}
        count={bookings ? bookings.length : 0}
        loading={bookingsLoading}
      />,
      key: 'bookings',
      children: <BookingsList onClickBooking={handleClickBooking} bookings={bookings} loading={bookingsLoading} />,
    },
  ]

  useEffect(() => {
    fetchBookings().then((data) => {
      setBookings(data.response.list)
    })
    fetchInvites().then((data) => {
      setInvites(data.response.list)
    })
  }, [])

  return (
    <Layout.Content className={styles.pageContent}>
      <Col lg={12} xs={24} sm={24} className={styles.containerColumn}>
        <Tabs
          tabBarStyle={{ marginBottom: '2rem' }}
          items={tabItems}
          className={styles.tabs}
        />
      </Col>
    </Layout.Content>
  )
}

type InvitesListProps = {
  invites: Invite[]
  loading: boolean
  onClickInvite: (id: number) => void
}
const InvitesList: FC<InvitesListProps> = ({ invites, loading, onClickInvite }) => (
  <Row gutter={[0, 12]}>
    {loading ? <FullWidthSkeleton active rows={SKELETON_ROWS} height={SKELETON_ROW_HEIGHT} /> : (
      <>
        {
          invites.map(invite => (
            <DetailsCard
              title={invite.title || ''}
              key={invite.id}
              description={invite.description || ''}
              onButtonClick={() => onClickInvite(invite.workshopInviteId)}
              buttonText={I18n.t('frontend.bookings.buttons.book')}
              subtitle={(
                <Subtitle
                  isActionByCurrentUser={null}
                  duration={
                    invite.duration
                  }
                  timezone=""
                />
              )}
            />
          ))
        }
      </>
    )}
  </Row>
)

type BookingsListProps = {
  bookings: Booking[]
  loading: boolean
  onClickBooking: (id: number) => void
}

const BookingsList: FC<BookingsListProps> = ({ bookings, loading, onClickBooking }) => (
  <Row gutter={[0, 12]}>
    {loading ? <FullWidthSkeleton active rows={SKELETON_ROWS} height={SKELETON_ROW_HEIGHT} /> : (
      <>
        {bookings.map((booking) => {
          const statusElement = _.includes(
            SHOW_STATUSES, booking.status,
          ) ? (<StatusText taskStatus={booking.status} />) : (<></>)

          const deadlineToAllowCancelByUser = moment(booking?.date).clone()
            .subtract(booking?.cancellationLeadTime, 's')
          const allowBookAgain = booking?.status === 'cancelled' && moment().isSameOrBefore(deadlineToAllowCancelByUser)

          let buttonText = null

          if (_.includes(MODIFY_FOR_STATUSES, booking.status)) {
            buttonText = I18n.t('frontend.bookings.buttons.modify')
          } else if (allowBookAgain) {
            buttonText = I18n.t('frontend.bookings.buttons.book_again')
          }

          return (
            <DetailsCard
              status={statusElement}
              title={booking.title || ''}
              key={booking.id}
              description={booking.description || ''}
              onButtonClick={() => onClickBooking(booking.workshopInviteId)}
              buttonText={buttonText || undefined}
              subtitle={(
                <Subtitle
                  duration={
                    booking.duration
                  }
                  isActionByCurrentUser={booking.isActionByCurrentUser}
                  dateTime={booking.date}
                  timezone={booking.timezone}
                />
              )}
            />
          )
        })}
      </>
    )}
  </Row>
)

type SubtitleProps = {
  duration: number | null,
  dateTime?: string | null,
  timezone: string | null,
  isActionByCurrentUser: boolean | null
}
const Subtitle: FC<SubtitleProps> = ({
  duration, dateTime, timezone, isActionByCurrentUser,
}) => {
  let dateTimeWithTimezone
  let dateTimeWithTimezoneEnd

  if (dateTime && timezone) {
    dateTimeWithTimezone = moment.tz(dateTime, timezone)
    dateTimeWithTimezoneEnd = moment.tz(dateTime, timezone).add(duration, 's')
  }

  return (
    <Space direction="vertical">
      <Space>
        <TimerText
          text={duration ? secondsToDayHoursAndMinutes(duration) : ''}
          textType="none"
          className={styles.subtitleIcon}
        />
        {dateTime && timezone && (
          <>
            <CalendarOutlined className={styles.subtitleIcon} />
            {dateTimeWithTimezone.format('Do MMMM YYYY')}
            {dateTimeWithTimezone.format('hh:mmA')}
            -
            {dateTimeWithTimezoneEnd?.format('hh:mmA')}
          </>
        )}
      </Space>
      {!_.isNull(isActionByCurrentUser) && (
        <Text disabled>
          { isActionByCurrentUser
            ? I18n.t('frontend.bookings.operation_by_admin') : I18n.t('frontend.bookings.operation_by_user')}
        </Text>
      )}
    </Space>
  )
}

type TabLabelProps = {
  title: string,
  count : number,
  loading: boolean
}
const TabLabel:FC<TabLabelProps> = ({ title, count, loading }) => (
  <Title level={4} style={{ marginBottom: '0px' }}>
    <Space size="small">
      {title}
      <Text type="secondary" className={styles.count}>
        (
        {loading ? <Skeleton.Button className={styles.countSkeleton} size="small" active /> : <>{count}</>}
        )
      </Text>
    </Space>
  </Title>
)

export const BookingsAndInvitesList = connector(BookingsAndInvitesListComponent)
