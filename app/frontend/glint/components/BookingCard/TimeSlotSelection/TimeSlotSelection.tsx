import { FC, ReactNode, useContext } from 'react'
import {
  Space, Typography, Button,
} from 'antd'
import cs from 'classnames'


import dayjs from '~/utils/dayjs'
import styles from './TimeSlotSelection.less'
import { DirectionalBackArrowIcon, MediaQueryContext } from '~/glint'

const { Title } = Typography
export const TIME_FORMAT = 'hh:mm a'
export type TimeSlot = {
  id: number,
  date: dayjs.Dayjs
}
type Props = {
  availableSlots: TimeSlot[]
  selectedDate: dayjs.Dayjs | null
  selectedDateTime: dayjs.Dayjs | null
  onTimeSelection: (slot: TimeSlot|null) => void
  onCancelDateSelection: () => void | null
  questionnaireComponent: ReactNode
}

export const TimeSlotSelection:FC<Props> = ({
  selectedDate,
  availableSlots,
  onTimeSelection, onCancelDateSelection, selectedDateTime, questionnaireComponent,
}) => {
  const formattedDate = selectedDate?.clone().format('ddd/MMM')
  const [day, month] = formattedDate?.split('/') || []
  const date = selectedDate?.clone().format('Do')
  const dateText = `${date} ${month}${selectedDateTime ? ',' : ''}`
  const { isMobile, isTablet } = useContext(MediaQueryContext) || { isMobile: null, isTablet: null }

  return (
    <Space className="w-100" direction="vertical">
      <div>
        <Space size="small">
          {/* Show back icon when time-slot is selected.
          But for small screen devices show it always, even before time-slot selection  */}
          {(selectedDateTime || isMobile || isTablet)
            ? (
              <Title
                onClick={() => {
                  // If time is selected clear only time selection
                  if (selectedDateTime) {
                    return onTimeSelection(null)
                  }
                  // for small screen devices clear date selection to go back to calendar
                  selectedDate && onCancelDateSelection()
                }}
                className="mb-0 cursor-pointer"
                level={5}
              >
                <DirectionalBackArrowIcon data-testid="back-icon" />
              </Title>
            ) : null}
          <Title className="mb-0 text-nowrap" level={5}>{`${day},`}</Title>
          <Title className="mb-0 font-normal text-nowrap" level={5}>{dateText}</Title>
          {selectedDateTime ? (
            <Title
              className="mb-0 font-normal text-nowrap ltr"
              level={5}
              data-testid="selected-time"
            >
              {selectedDateTime.format(TIME_FORMAT)}
            </Title>
          ) : null}
        </Space>
      </div>
      {selectedDateTime ? <>{ questionnaireComponent }</> : (
        <>
          {availableSlots.map((slot) => {
            const formattedTimeText = slot.date.format(TIME_FORMAT)
            return (
              <Button
                onClick={() => onTimeSelection(slot)}
                size="large"
                className={cs(styles.button, 'ltr')}
                key={formattedTimeText}
                block
              >
                {formattedTimeText}
              </Button>
            )
          })}
        </>
      )
    }
    </Space>
  )
}
