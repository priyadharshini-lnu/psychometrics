import React, { useState } from 'react'
import {
  Card, Typography, Button, Switch, Flex,
} from 'antd'
import dayjs from '~/utils/dayjs'
import MaintenanceForm from './MaintenanceForm'

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
    <Card title={label}>
      {isEditing ? (
        <MaintenanceForm
          subsystemKey={subsystemKey}
          maintenanceSetting={maintenanceSetting}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      ) : (
        <Flex vertical gap="middle">
          <Flex align="center" gap="middle">
            <Switch
              checked={maintenanceSetting?.maintenanceWindowEnabled}
              disabled
            />
            <Typography.Text strong>
              {I18n.t('admin.enable_maintenance')}
            </Typography.Text>
          </Flex>
          <Flex align="center" gap="small">
            <Typography.Text type="secondary" className="fs-18">
              {I18n.t('admin.timezone')}
              :
            </Typography.Text>
            <Typography.Text strong className="fs-16">
              {maintenanceSetting?.timeZone || '-'}
            </Typography.Text>
          </Flex>
          <Flex align="center" gap="small">
            <Typography.Text type="secondary" className="fs-18">
              {I18n.t('admin.start_time')}
              :
            </Typography.Text>
            <Typography.Text strong className="fs-16">
              {formatTimeForDisplay(
                maintenanceSetting?.startTime,
                maintenanceSetting?.timeZone,
              )}
            </Typography.Text>
          </Flex>
          <Flex align="center" gap="small">
            <Typography.Text type="secondary" className="fs-18">
              {I18n.t('admin.end_time')}
              :
            </Typography.Text>
            <Typography.Text strong className="fs-16">
              {formatTimeForDisplay(
                maintenanceSetting?.endTime,
                maintenanceSetting?.timeZone,
              )}
            </Typography.Text>
          </Flex>
          <Flex justify="end">
            <Button type="default" onClick={handleEdit}>
              {I18n.t('common.actions.edit')}
            </Button>
          </Flex>
        </Flex>
      )}
    </Card>
  )
}

export default MaintenanceCard
