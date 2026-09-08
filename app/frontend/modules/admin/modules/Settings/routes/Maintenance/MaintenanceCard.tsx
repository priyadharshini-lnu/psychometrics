import React, { useState } from 'react'
import {
  Card, Button, Flex,
} from '@thetalententerprise/glint'
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
    >
      <Flex vertical gap="middle" flex={1}>
        <MaintenanceForm
          subsystemKey={subsystemKey}
          maintenanceSetting={maintenanceSetting}
          isEditing={isEditing}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
        {!isEditing && (
          <Flex justify="end" align="end" flex={1}>
            <Button type="default" onClick={handleEdit}>
              {I18n.t('common.actions.edit')}
            </Button>
          </Flex>
        )}
      </Flex>
    </Card>
  )
}

export default MaintenanceCard
