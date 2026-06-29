import React, { useState } from 'react'
import { Switch } from 'antd'
import { useResourceContext } from '~/modules/admin/components/Resource'
import { Application, ApplicationTR } from '~/modules/admin/modules/client/core/applications'

export const ApplicationStatusSwitch: React.FC<{ record: Application }> = ({ record }) => {
  const { resource } = useResourceContext<Application>()
  const [isToggling, setIsToggling] = useState(false)

  const handleToggle = async (checked: boolean) => {
    setIsToggling(true)
    try {
      await resource.memberAction({
        id: record.id,
        action: checked ? 'activate' : 'deactivate',
        method: 'post',
        updateStore: true,
        responseType: ApplicationTR,
      })
    } finally {
      setIsToggling(false)
    }
  }

  return (
    <Switch
      checked={!record.disabled}
      loading={isToggling}
      onChange={handleToggle}
    />
  )
}
