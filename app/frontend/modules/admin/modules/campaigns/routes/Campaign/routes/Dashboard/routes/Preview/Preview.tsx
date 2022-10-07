import React, { useEffect } from 'react'
import { Skeleton } from 'antd'
import { useResources } from 'hooks/useResources'
import { Dashboard as DashboardType, DashboardTR } from 'modules/admin/modules/campaigns/core/dashboard'
import { EmbeddedDashboard } from 'modules/admin/modules/Dashboard/components/EmbeddedDashboard'
import { useParams } from 'react-router-dom'

export const Preview: React.FC = () => {
  const { campaignId } = useParams<{ campaignId: string }>()
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
