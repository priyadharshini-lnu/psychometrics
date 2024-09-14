import React, { useEffect } from 'react'
import { Skeleton } from 'antd'
import { useParams } from 'react-router-dom'
import { useResources } from '~/hooks/useResources'
import { Dashboard as DashboardType, DashboardTR } from '~/modules/admin/modules/campaigns/core/dashboard'
import { EmbeddedDashboard } from '~/modules/admin/modules/Dashboard/components/EmbeddedDashboard'

export const Preview: React.FC = () => {
  const { campaignId } = useParams() as { campaignId: string }
  const {
    fetch, data, isRequestSuccessful,
  } = useResources<DashboardType>('dashboards', { responseType: DashboardTR })
  const fetchSuccessful = isRequestSuccessful('fetch')

  useEffect(() => {
    fetch({
      apiConfig: {
        filter: { campaign_id_eq: campaignId },
        query: { embed_token: true },
      },
    })
  }, [])

  if (!fetchSuccessful || !data[0]) return <Skeleton active />

  const { reportId, embedToken, name } = data[0]

  return (
    <EmbeddedDashboard dashboardName={name} reportId={reportId} embedToken={embedToken} />
  )
}
