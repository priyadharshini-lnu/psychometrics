import {
  FC, ReactNode, useContext, useEffect, useRef,
} from 'react'
import {
  Space, Typography, Button,
} from 'antd'
import cs from 'classnames'


import dayjs from '~/utils/dayjs'
import styles from './TimeSlotSelection.less'
import { DirectionalBackArrowIcon, MediaQueryContext } from '~/glint'

const { Title } = Typography
export const TIME_FORMAT = 'hh:mm a'
const { I18n } = window

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
  const firstSlotRef = useRef<HTMLButtonElement>(null)
  const clearTimeBtnRef = useRef<HTMLButtonElement>(null)
  const formattedDate = selectedDate?.clone().format('ddd/MMM')
  const [day, month] = formattedDate?.split('/') || []
  const date = selectedDate?.clone().format('Do')
  const dateText = `${date} ${month}${selectedDateTime ? ',' : ''}`
  const { isMobile, isTablet } = useContext(MediaQueryContext) || { isMobile: null, isTablet: null }

  useEffect(() => {
    if (firstSlotRef.current) {
      firstSlotRef.current.focus()
    }
  }, [])

  useEffect(() => {
    if (clearTimeBtnRef.current) {
      clearTimeBtnRef.current.focus()
    }
  }, [selectedDateTime, isMobile, isTablet])

  return (
    <Space className="w-100" orientation="vertical">
      <div>
        <Space size={0}>
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
                <Button
                  aria-label={I18n.t('glint.booking_card.aria_back_to_time_selection')}
                  className="ps-0 pe-2"
                  type="text"
                  ref={clearTimeBtnRef}
                >
                  <DirectionalBackArrowIcon data-testid="back-icon" />
                </Button>
              </Title>
            ) : null}
          <Space size="small">
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
        </Space>
      </div>
      {selectedDateTime ? <>{ questionnaireComponent }</> : (
        <>
          {availableSlots.map((slot, index) => {
            const formattedTimeText = slot.date.format(TIME_FORMAT)
            return (
              <Button
                ref={index === 0 ? firstSlotRef : null}
                aria-description={I18n.t('glint.booking_card.aria_available_time')}
                onClick={() => onTimeSelection(slot)}
                size="large"
                className={cs(styles.button, 'ltr')}
                key={slot.id}
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
