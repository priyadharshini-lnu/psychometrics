import React from 'react'
import { Outlet, useParams } from 'react-router-dom'
import Menu from './Menu'
import settings from '../../../../settings'

const AssessmentsReports: React.FC = () => {
  const { campaignId } = useParams() as { campaignId: string }
  return (
    <div>
      <Menu prefix={`${settings.urlPrefix}/${campaignId}/assessments_reports`} />
      <Outlet />
    </div>
  )
}

export default AssessmentsReports
