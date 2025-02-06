import {
  useState, FC, useRef, useEffect,
} from 'react'
import {
  Calendar, Space, Typography, CalendarProps, Button,
} from 'antd'
import cs from 'classnames'
import dayjs from '~/utils/dayjs'
import { DirectionalArrowIcon, DirectionalBackArrowIcon } from '~/glint'

import styles from './CustomCalendar.less'

const { Title } = Typography
const { I18n } = window

type Props = {
  availableDates:dayjs.Dayjs[],
  onDateSelect: (date: dayjs.Dayjs | null) => void
} & CalendarProps<dayjs.Dayjs>

export const CustomCalendar: FC<Props> = ({ availableDates, onDateSelect, defaultValue }) => {
  const [currentDate, setCurrentDate] = useState(defaultValue || dayjs())
  const formattedAvailableDates = availableDates.map(date => date.format('DD/MM/YYYY'))
  const calendarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const calendarPanel = calendarRef.current?.querySelector('.ant-picker-panel')
    if (calendarPanel) {
      calendarPanel.setAttribute('tabindex', '-1')
    }
  }, [])

  return (
    <div ref={calendarRef}>
      <Calendar
        defaultValue={defaultValue || dayjs()}
        fullscreen={false}
        className={styles.calendar}
        headerRender={({ value, onChange }) => {
          const current = value.clone()
          const year = value.year()
          const monthNumber = value.month()
          const month = current.format('MMM')
          const monthName = current.format('MMMM')

          return (
            <Space className="mb-2" size="middle">
              <Button
                onClick={() => {
                  onChange(value.clone().month(monthNumber - 1))
                }}
                size="small"
                type="text"
                aria-label={I18n.t('glint.booking_card.aria_label_previous_month')}
                aria-description={I18n.t('glint.booking_card.aria_desc_current_month', { month: monthName, year })}
              >
                <DirectionalBackArrowIcon
                  date-testid="prev-month"
                />
              </Button>
              <Space size="small">
                <Title data-testid="month" className="mb-0" level={5}>{month}</Title>
                <Title data-testid="year" className="mb-0 font-normal" level={5}>{year}</Title>
              </Space>
              <Button
                onClick={() => {
                  onChange(value.clone().month(monthNumber + 1))
                }}
                size="small"
                type="text"
                aria-label={I18n.t('glint.booking_card.aria_label_next_month')}
                aaria-description={I18n.t('glint.booking_card.aria_desc_current_month', { monthName, year })}
              >
                <DirectionalArrowIcon
                  date-testid="nextMonth"
                />
              </Button>
            </Space>
          )
        }}
        dateFullCellRender={(date) => {
          const monthNumber = date.month()
          const dateString = date.format('DD/MM/YYYY')
          const dateExistInCurrentMonth = monthNumber === currentDate.month()
          const isPastDate = !date.isAfter(dayjs())
          const isDateAvailable = formattedAvailableDates.includes(dateString) && dateExistInCurrentMonth && !isPastDate
          const dateToDisplay = monthNumber === currentDate.month() ? date.date() : ''

          return (
            <div
              role={isDateAvailable ? 'button' : 'none'}
              aria-label={
              isDateAvailable ? `${date.format('dddd')} ${dateToDisplay} ${date.format('MMMM')} ${date.year()}` : ''}
            // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
              tabIndex={isDateAvailable ? 0 : -1}
              className={cs({
                [styles.dateCell]: true,
                [styles.selectedDate]: isDateAvailable,
                [styles.unavailableDate]: !isDateAvailable,
                [styles.pastDate]: isPastDate && dateExistInCurrentMonth,
              })}
              onKeyUp={(e) => {
                if (e.keyCode === 32 || e.keyCode === 13) {
                  isDateAvailable && onDateSelect(date)
                }
              }}
              onClick={() => {
                isDateAvailable && onDateSelect(date)
              }}
            >
              {dateToDisplay}
            </div>
          )
        }}
        onPanelChange={(date) => {
          setCurrentDate(date)
          onDateSelect(null)
        }}
      />
    </div>
  )
}
