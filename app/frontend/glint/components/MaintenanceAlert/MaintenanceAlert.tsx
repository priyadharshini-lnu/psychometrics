import React, { useEffect } from 'react'
import {
  Alert, Statistic,
} from 'antd'
import dayjs from '~/utils/dayjs'
import { dateTimeWithZone } from '~/utils/time'

interface MaintenanceSetting {
  subSystem: string
  maintenanceWindowEnabled: boolean
  startTime: string | null
  endTime: string | null
  timeZone: string
  maintenanceDuration?: number
  active?: boolean
}

export type MaintenanceStatus = 'upcoming' | 'inProgress' | ''

interface MaintenanceAlertProps {
  maintenanceEnabled: boolean
  maintenanceSetting?: MaintenanceSetting
  maintenanceStatus?: MaintenanceStatus
  onStatusChange?: (status: MaintenanceStatus) => void
}

const { I18n } = window
const { Timer } = Statistic

export const MaintenanceAlert: React.FC<MaintenanceAlertProps> = ({
  maintenanceEnabled,
  maintenanceSetting,
  maintenanceStatus,
  onStatusChange,
}) => {
  const {
    maintenanceWindowEnabled,
    startTime,
    endTime,
    timeZone,
    maintenanceDuration,
  } = maintenanceSetting || {}

  if (!maintenanceEnabled || !maintenanceWindowEnabled) return null

  const now = dayjs().tz(timeZone)
  const start = dayjs(startTime).tz(timeZone)
  const end = dayjs(endTime).tz(timeZone)

  useEffect(() => {
    if (!maintenanceEnabled || !maintenanceWindowEnabled) {
      onStatusChange?.('')
    }
    if (now.isBefore(start)) {
      onStatusChange?.('upcoming')
    } else if (now.isAfter(start) && now.isBefore(end)) {
      onStatusChange?.('inProgress')
    } else {
      onStatusChange?.('')
    }
  }, [])

  if (!maintenanceStatus) return null

  const alert = getAlertData(maintenanceStatus, startTime as string, maintenanceDuration)

  return (
    <>
      <Alert
        type="warning"
        title={alert?.message}
        banner
        description={(
          <>
            {alert?.description}
            {maintenanceStatus === 'inProgress' && (
              <div className="mt-2 font-bold fs-14 flex items-center">
                <span>
                  {I18n.t('shared.maintenance_time_remaining')}
                </span>
                <Timer
                  type="countdown"
                  value={end.valueOf()}
                  onFinish={() => onStatusChange?.('')}
                  styles={{ content: { fontSize: '14px', marginLeft: '8px' } }}
                />
              </div>
            )}
          </>
        )}
        showIcon
      />
      {maintenanceStatus === 'upcoming' && (
        <Timer
          type="countdown"
          value={start.valueOf()}
          onFinish={() => onStatusChange?.('inProgress')}
          className="sr-only"
        />
      )}
    </>

  )
}

type AlertData = {
  message: string
  description: string
} | null

const getAlertData = (
  maintenanceStatus: MaintenanceStatus | undefined,
  startTime: string,
  maintenanceDuration?: number,
): AlertData => {
  if (!maintenanceStatus) return null

  if (maintenanceStatus === 'upcoming') {
    const dateWithTime = dateTimeWithZone(startTime)
    let durationText = ''

    if (typeof maintenanceDuration === 'number' && maintenanceDuration > 0) {
      if (maintenanceDuration >= 60) {
        const hours = Math.round(maintenanceDuration / 60)
        durationText = I18n.t('shared.maintenance_in_hours', { hours })
      } else {
        durationText = I18n.t('shared.maintenance_in_minutes', { minutes: maintenanceDuration })
      }
    }

    return {
      message: I18n.t('shared.maintenance_upcoming_title'),
      description: I18n.t('shared.maintenance_upcoming_description', {
        date: dateWithTime,
        duration: durationText,
      }),
    }
  }

  if (maintenanceStatus === 'inProgress') {
    return {
      message: I18n.t('shared.maintenance_in_progress_title'),
      description: I18n.t('shared.maintenance_in_progress_description'),
    }
  }

  return null
}
