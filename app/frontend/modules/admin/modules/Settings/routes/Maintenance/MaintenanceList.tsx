import React, { useEffect } from 'react'
import {
  Row, Col, Typography, Spin,
} from 'antd'
import { useResources } from '~/hooks/useResources'
import MaintenanceCard from './MaintenanceCard'
import { MAINTENANCE_SUBSYSTEMS } from '../../core/constants'
import { DocumentTitle } from '~/components/DocumentTitle'

const { I18n } = window

interface MaintenanceSetting {
  id: string
  subSystem: string
  maintenanceWindowEnabled: boolean
  timeZone: string
  startTime: string
  endTime: string
}

const MaintenanceList: React.FC = () => {
  const {
    data,
    fetch,
    isLoading,
  } = useResources<MaintenanceSetting>(
    'maintenance_settings',
    {
      trackUrl: false,
    },
  )

  useEffect(() => {
    fetch()
  }, [])

  return (
    <>
      <DocumentTitle text={I18n.t('admin.maintenance')} />
      <div className="p-4">
        <Typography.Title level={4}>{I18n.t('admin.maintenance')}</Typography.Title>
        <Typography.Paragraph type="secondary" className="mb-8">
          {I18n.t('admin.maintenance_settings_description')}
        </Typography.Paragraph>

        {isLoading('fetch') && data.length === 0 ? (
          <div className="flex justify-center items-center p-6">
            <Spin />
          </div>
        ) : (
          <Row gutter={[24, 24]}>
            {MAINTENANCE_SUBSYSTEMS.map((subsystem) => {
              const maintenanceSetting = data.find(s => s.subSystem === subsystem.key)
              return (
                <Col key={subsystem.key} xs={24} sm={12} lg={6}>
                  <MaintenanceCard
                    subsystemKey={subsystem.key}
                    label={I18n.t(subsystem.labelKey)}
                    maintenanceSetting={maintenanceSetting}
                    onSuccess={fetch}
                  />
                </Col>
              )
            })}
          </Row>
        )}
      </div>
    </>
  )
}

export default MaintenanceList
