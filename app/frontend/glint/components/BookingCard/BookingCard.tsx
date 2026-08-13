import {
  ReactNode, FC, useState, useEffect, useContext,
} from 'react'
import { Divider, Col, Row } from 'antd'
import cs from 'classnames'
import dayjs from '~/utils/dayjs'

import { MediaQueryContext } from '~/glint'
import { InvitationTitle } from './InvitationTitle'
import { CustomCalendar } from './CustomCalendar'
import { TimeSlotSelection, TimeSlot } from './TimeSlotSelection'

import styles from './BookingCard.less'

type Props = {
  title: string,
  description: string,
  availableDateTimes: TimeSlot[],
  currentDateTime: dayjs.Dayjs | null,
  questionnaireComponent?: ReactNode
  onDateTimeSelection: (timeSlot: TimeSlot |null) => void
  bookingTimeZone?: string | null
}

export const BookingCard: FC<Props> = ({
  title,
  description,
  availableDateTimes,
  currentDateTime,
  questionnaireComponent,
  onDateTimeSelection,
  bookingTimeZone,
}) => {
  const [timeZone, setTimeZone] = useState(bookingTimeZone || 'Asia/Muscat')
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(currentDateTime?.tz(timeZone) || null)
  const [availableDateTimesAsPerZone, setAvailableDatesTimeAsPerZone] = useState(availableDateTimes)
  const [availableSlotsAsPerZone, setAvailableSlotsAsPerZone] = useState<TimeSlot[]>([])
  const selectedDateTimeAsPerTimeZone = currentDateTime ? currentDateTime.tz(timeZone) : null
  const { isMobile, isTablet, isDesktop } = useContext(MediaQueryContext) || { isMobile: null, isTablet: null }

  const currentTimeAsPerZone = dayjs().tz(timeZone)
  const isSmallScreen = isMobile || isTablet
  const inviteTitleFlex = isDesktop ? '7' : '1 1 50%'
  const calendarFlex = isDesktop ? '8' : '1 1 auto'
  const futureAvailableDateTimes = availableDateTimesAsPerZone
    .filter(availableDateTime => availableDateTime.date.isSameOrAfter(currentTimeAsPerZone))
    .sort((firstDate, secondDate) => firstDate.date.diff(secondDate.date))
  const firstAvailableDateTimeAsPerZone = futureAvailableDateTimes[0]?.date

  useEffect(() => {
    const selectedDateString = selectedDate?.format('DD/MM/YYYY')
    const availableSlotsList = availableDateTimesAsPerZone
      .filter(dateObj => dateObj.date.format('DD/MM/YYYY') === selectedDateString)
    setAvailableSlotsAsPerZone(availableSlotsList)
  }, [])

  useEffect(() => {
    setAvailableDatesTimeAsPerZone(availableDateTimesAsPerZone
      .map(dateObj => ({ id: dateObj.id, date: dateObj.date.tz(timeZone) })))
  }, [timeZone])

  const handleTimeZoneChange = (zone) => {
    setTimeZone(zone)
    // Clear currently selected date and time when timezone is changed by the user
    setSelectedDate(null)
    onDateTimeSelection(null)
  }

  const handleDateSelect = (date: dayjs.Dayjs | null) => {
    setSelectedDate(date)
    // clear selected time-slot(if exists) when date is changed
    selectedDateTimeAsPerTimeZone && onDateTimeSelection(null)
    const selectedDateString = date?.format('DD/MM/YYYY')
    const availableSlotsList = availableDateTimesAsPerZone
      .filter(dateObj => dateObj.date.format('DD/MM/YYYY') === selectedDateString)
    setAvailableSlotsAsPerZone(availableSlotsList)
  }

  const invitationComponent = (
    <InvitationTitle
      currentTimeZone={timeZone}
      onTimeZoneChange={handleTimeZoneChange}
      title={title}
      description={description}
    />
  )

  const calendarComponent = (
    <CustomCalendar
      availableDates={availableDateTimesAsPerZone.map(dateObj => dateObj.date)}
      onDateSelect={handleDateSelect}
      value={selectedDate || undefined}
      defaultValue={firstAvailableDateTimeAsPerZone || dayjs()}
    />
  )

  const timeSlotSelectionComponent = (
    <TimeSlotSelection
      availableSlots={availableSlotsAsPerZone}
      selectedDate={selectedDate}
      selectedDateTime={selectedDateTimeAsPerTimeZone}
      onTimeSelection={onDateTimeSelection}
      onCancelDateSelection={() => setSelectedDate(null)}
      questionnaireComponent={questionnaireComponent}
    />
  )

  const desktopView = (
    <Row className={styles.container} wrap={false}>
      <Col flex={selectedDate ? '' : inviteTitleFlex}>
        <div className={cs(styles.cardItem, { [styles.limitTitleWidth]: selectedDate })}>
          {invitationComponent}
        </div>
      </Col>
      <Col><Divider className="h-100 pos-uns" orientation="vertical" /></Col>
      <Col flex={selectedDate ? '' : calendarFlex}>
        <div className={styles.cardItem}>
          {calendarComponent}
        </div>
      </Col>
      {selectedDate && (
        <>
          <Col><Divider className="h-100 pos-uns" orientation="vertical" /></Col>
          <Col flex="auto">
            <div className={cs(styles.cardItem, styles.timeContainer)}>
              {timeSlotSelectionComponent}
            </div>
          </Col>
        </>
      )
      }
    </Row>
  )

  const mobileView = (
    <>
      {!selectedDate
        ? (
          <>
            {invitationComponent}
            <Divider />
            {calendarComponent}
          </>
        )
        : timeSlotSelectionComponent
      }
    </>
  )

  return <>{isSmallScreen ? mobileView : desktopView }</>
}
