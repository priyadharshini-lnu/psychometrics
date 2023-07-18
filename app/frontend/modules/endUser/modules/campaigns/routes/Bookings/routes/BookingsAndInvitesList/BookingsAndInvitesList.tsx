import { FC, useEffect, useState } from 'react'
import {
  Tabs, Row, Col, Space, Typography, Skeleton, Layout,
} from 'antd'
import { CalendarOutlined } from '@ant-design/icons'
import { connect, ConnectedProps } from 'react-redux'
import { useHistory, useLocation } from 'react-router-dom'

import { DetailsCard, FullWidthSkeleton } from '~/glint'
import { TimerText } from '~/modules/endUser/modules/campaigns/components/TimerText'
import {
  fetchBookings, fetchInvites, Booking, Invite, FETCH_BOOKINGS, FETCH_INVITES,
} from '~/modules/endUser/modules/campaigns/core/bookings'
import { RootState } from '~/modules/endUser/core/rootReducers'
import { isRequestInProgress } from '~/core/request'
import styles from './BookingsAndInvitesList.less'

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

export const BookingsAndInvitesListComponent:FC<PropsFromRedux> = ({
  fetchBookings, fetchInvites, bookingsLoading, invitesLoading,
}) => {
  const [invites, setInvites] = useState<Invite[]|[]>([])
  const [bookings, setBookings] = useState<Booking[] | []>([])
  const history = useHistory()
  const location = useLocation()

  const handleClickInvite = (id: number) => {
    history.push(`${location.pathname}/${id}/booking`)
  }
  const tabItems = [
    {
      label: <TabLabel
        title={I18n.t('bookings.tab_label.invites')}
        count={invites ? invites.length : 0}
        loading={invitesLoading}
      />,
      key: 'invites',
      children: <InvitesList onClickInvite={handleClickInvite} invites={invites} loading={invitesLoading} />,
    },
    {
      label: <TabLabel
        title={I18n.t('bookings.tab_label.bookings')}
        count={bookings ? bookings.length : 0}
        loading={bookingsLoading}
      />,
      key: 'bookings',
      children: <BookingsList bookings={bookings} loading={bookingsLoading} />,
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
              title={invite.title}
              key={invite.id}
              description={invite.description}
              onButtonClick={() => onClickInvite(invite.id)}
              buttonText={I18n.t('bookings.buttons.book')}
              subtitle={<Subtitle duration={invite.duration} />}
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
}
const BookingsList: FC<BookingsListProps> = ({ bookings, loading }) => (
  <Row gutter={[0, 12]}>
    {loading ? <FullWidthSkeleton active rows={SKELETON_ROWS} height={SKELETON_ROW_HEIGHT} /> : (
      <>
        {
          bookings.map(booking => (
            <DetailsCard
              title={booking.title}
              key={booking.id}
              description={booking.description}
              onButtonClick={() => null}
              buttonText={I18n.t('bookings.buttons.modify')}
              subtitle={<Subtitle duration={booking.duration} dateTime={booking.dateTime} />}
            />
          ))
        }
      </>
    )}
  </Row>
)

type SubtitleProps = {
  duration: number,
  dateTime? : string
}
const Subtitle: FC<SubtitleProps> = ({ duration, dateTime }) => (
  <Space size="large">
    <TimerText text={`${duration} mins`} textType="none" className={styles.subtitleIcon} />
    {dateTime && (
    <Space>
      <CalendarOutlined className={styles.subtitleIcon} />
      {`${dateTime} mins`}
    </Space>
    )}
  </Space>
)

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
