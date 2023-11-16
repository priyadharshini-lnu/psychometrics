import { useState, FC } from 'react'
import {
  Calendar, Space, Typography, CalendarProps,
} from 'antd'
import cs from 'classnames'
import dayjs from '~/utils/dayjs'
import { DirectionalArrowIcon, DirectionalBackArrowIcon } from '~/glint'

import styles from './CustomCalendar.less'

const { Title } = Typography

type Props = {
  availableDates:dayjs.Dayjs[],
  onDateSelect: (date: dayjs.Dayjs | null) => void
} & CalendarProps<dayjs.Dayjs>

export const CustomCalendar: FC<Props> = ({ availableDates, onDateSelect, defaultValue }) => {
  const [currentDate, setCurrentDate] = useState(defaultValue || dayjs())
  const formattedAvailableDates = availableDates.map(date => date.format('DD/MM/YYYY'))

  return (
    <Calendar
      defaultValue={defaultValue || dayjs()}
      fullscreen={false}
      className={styles.calendar}
      headerRender={({ value, onChange }) => {
        const current = value.clone()
        const year = value.year()
        const monthNumber = value.month()
        const month = current.format('MMM')

        return (
          <Space className="mb-2" size="middle">
            <DirectionalBackArrowIcon
              date-testid="prev-month"
              onClick={() => {
                onChange(value.clone().month(monthNumber - 1))
              }}
            />
            <Space size="small">
              <Title data-testid="month" className="mb-0" level={5}>{month}</Title>
              <Title data-testid="year" className="mb-0 font-normal" level={5}>{year}</Title>
            </Space>
            <DirectionalArrowIcon
              date-testid="nextMonth"
              onClick={() => {
                onChange(value.clone().month(monthNumber + 1))
              }}
            />
          </Space>
        )
      }}
      dateFullCellRender={(date) => {
        const monthNumber = date.month()
        const dateString = date.format('DD/MM/YYYY')
        const dateExistInCurrentMonth = monthNumber === currentDate.month()
        const isPastDate = !date.isAfter(dayjs())
        const isDateAvailable = formattedAvailableDates.includes(dateString) && dateExistInCurrentMonth && !isPastDate

        return (
          <div
            className={cs({
              [styles.dateCell]: true,
              [styles.selectedDate]: isDateAvailable,
              [styles.unavailableDate]: !isDateAvailable,
              [styles.pastDate]: isPastDate && dateExistInCurrentMonth,
            })}
            onClick={() => {
              isDateAvailable && onDateSelect(date)
            }}
          >
            {monthNumber === currentDate.month() ? date.date() : ''}
          </div>
        )
      }}
      onPanelChange={(date) => {
        setCurrentDate(date)
        onDateSelect(null)
      }}
    />
  )
}
