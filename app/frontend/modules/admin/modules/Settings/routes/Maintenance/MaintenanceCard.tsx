import React, { useState } from 'react'
import {
  Card, Typography, Button, Switch,
} from 'antd'
import dayjs from '~/utils/dayjs'
import MaintenanceForm from './MaintenanceForm'
import styles from './styles.less'

const { I18n } = window

interface MaintenanceSetting {
  id: string
  subSystem: string
  maintenanceWindowEnabled: boolean
  timeZone: string
  startTime: string
  endTime: string
}

interface MaintenanceCardProps {
  subsystemKey: string
  label: string
  maintenanceSetting?: MaintenanceSetting
  onSuccess: () => void
}

const DATE_FORMAT = 'DD/MM/YYYY'
const TIME_FORMAT = 'h:mm A'

const formatTimeForDisplay = (time: string | null | undefined, timezone: string | undefined) => {
  if (!time || !timezone) return '-'
  return dayjs(time).tz(timezone).format(`${DATE_FORMAT} ${TIME_FORMAT}`)
}

export const MaintenanceCard: React.FC<MaintenanceCardProps> = ({
  subsystemKey,
  label,
  maintenanceSetting,
  onSuccess,
}) => {
  const [isEditing, setIsEditing] = useState(false)

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  const handleSuccess = () => {
    setIsEditing(false)
    onSuccess()
  }

  return (
    <Card
      title={label}
      styles={{
        body: {
          overflow: 'hidden',
        },
      }}
    >
      {isEditing ? (
        <MaintenanceForm
          subsystemKey={subsystemKey}
          maintenanceSetting={maintenanceSetting}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      ) : (
        <div className="pb-8">
          <div className={styles.scrollableContent}>
            <div className="mb-6 flex items-center">
              <Switch
                checked={maintenanceSetting?.maintenanceWindowEnabled}
                disabled
              />
              <Typography.Text strong className="ms-4">
                {I18n.t('admin.enable_maintenance')}
              </Typography.Text>
            </div>
            <div className="mb-6">
              <div className="flex items-center">
                <Typography.Text type="secondary" className="fs-18 me-2">
                  {I18n.t('admin.timezone')}
                  :
                </Typography.Text>
                <Typography.Text strong className="fs-16">
                  {maintenanceSetting?.timeZone || '-'}
                </Typography.Text>
              </div>
            </div>
            <div className="mb-6">
              <div className="flex items-center">
                <Typography.Text type="secondary" className="fs-18 me-2">
                  {I18n.t('admin.start_time')}
                  :
                </Typography.Text>
                <Typography.Text strong className="fs-16">
                  {formatTimeForDisplay(
                    maintenanceSetting?.startTime,
                    maintenanceSetting?.timeZone,
                  )}
                </Typography.Text>
              </div>
            </div>
            <div className="mb-6">
              <div className="flex items-center">
                <Typography.Text type="secondary" className="fs-18 me-2">
                  {I18n.t('admin.end_time')}
                  :
                </Typography.Text>
                <Typography.Text strong className="fs-16">
                  {formatTimeForDisplay(
                    maintenanceSetting?.endTime,
                    maintenanceSetting?.timeZone,
                  )}
                </Typography.Text>
              </div>
            </div>
          </div>
          <div className={styles.footer}>
            <Button type="default" onClick={handleEdit} key="edit">
              {I18n.t('common.actions.edit')}
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}

export default MaintenanceCard
