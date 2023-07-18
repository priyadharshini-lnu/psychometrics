import {
  ReactNode, FC, useState, useEffect, useContext,
} from 'react'
import { Divider, Col, Row } from 'antd'
import moment, { Moment } from 'moment-timezone'
import cs from 'classnames'

import { MediaQueryContext } from '~/glint'
import { InvitationTitle } from './InvitationTitle'
import { CustomCalendar } from './CustomCalendar'
import { TimeSlotSelection } from './TimeSlotSelection'

import styles from './BookingCard.less'

type Props = {
  title: string,
  description: string,
  availableDateTimes: Moment[],
  currentDateTime: Moment | null,
  questionnaireComponent?: ReactNode
  onDateTimeSelection: (date: Moment |null) => void
  calendarDefaultValue?: Moment
}

export const BookingCard: FC<Props> = ({
  title,
  description,
  availableDateTimes,
  currentDateTime,
  questionnaireComponent,
  onDateTimeSelection,
  calendarDefaultValue,
}) => {
  const [timeZone, setTimeZone] = useState(moment.tz.guess() || 'Asia/Muscat')
  const [selectedDate, setSelectedDate] = useState<Moment | null>(currentDateTime?.tz(timeZone) || null)
  const [availableDateTimesAsPerZone, setAvailableDatesTimeAsPerZone] = useState(availableDateTimes)
  const [availableSlotsAsPerZone, setAvailableSlotsAsPerZone] = useState<Moment[]>([])
  const selectedDateTimeAsPerTimeZone = currentDateTime ? currentDateTime.tz(timeZone) : null
  const { isMobile, isTablet, isDesktop } = useContext(MediaQueryContext) || { isMobile: null, isTablet: null }
  const isSmallScreen = isMobile || isTablet
  const inviteTitleFlex = isDesktop ? '7' : '1 1 50%'
  const calendarFlex = isDesktop ? '8' : '1 1 auto'

  useEffect(() => {
    const selectedDateString = selectedDate?.format('DD/MM/YYYY')
    const availableSlotsList = availableDateTimesAsPerZone
      .filter(date => date.format('DD/MM/YYYY') === selectedDateString)
    setAvailableSlotsAsPerZone(availableSlotsList)
  }, [])

  useEffect(() => {
    setAvailableDatesTimeAsPerZone(availableDateTimesAsPerZone.map(date => date.tz(timeZone)))
  }, [timeZone])

  const handleTimeZoneChange = (zone) => {
    setTimeZone(zone)
    // Clear currently selected date and time when timezone is changed by the user
    setSelectedDate(null)
    onDateTimeSelection(null)
  }

  const handleDateSelect = (date: Moment | null) => {
    setSelectedDate(date)
    // clear selected time-slot(if exists) when date is changed
    selectedDateTimeAsPerTimeZone && onDateTimeSelection(null)
    const selectedDateString = date?.format('DD/MM/YYYY')
    const availableSlotsList = availableDateTimesAsPerZone
      .filter(date => date.format('DD/MM/YYYY') === selectedDateString)
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
      availableDates={availableDateTimesAsPerZone}
      onDateSelect={handleDateSelect}
      value={selectedDate || undefined}
      defaultValue={calendarDefaultValue || moment()}
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
      <Col><Divider className="h-100 pos-uns" type="vertical" /></Col>
      <Col flex={selectedDate ? '' : calendarFlex}>
        <div className={styles.cardItem}>
          {calendarComponent}
        </div>
      </Col>
      {selectedDate && (
        <>
          <Col><Divider className="h-100 pos-uns" type="vertical" /></Col>
          <Col flex="auto">
            <div className={styles.cardItem}>
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
