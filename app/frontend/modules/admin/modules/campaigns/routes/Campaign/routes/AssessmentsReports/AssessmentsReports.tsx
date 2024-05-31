import React from 'react'
import { useParams } from 'react-router-dom'
import RouteList from '~/components/RouteList'
import Menu from './Menu'
import routes from './routes'
import settings from '../../../../settings'

const AssessmentsReports: React.FC = () => {
  const { campaignId } = useParams() as { campaignId: string }
  return (
    <div>
      <Menu prefix={`${settings.urlPrefix}/${campaignId}/assessments_reports`} />
      <RouteList routes={routes} urlPrefix="" />
    </div>
  )
}

export default AssessmentsReports
