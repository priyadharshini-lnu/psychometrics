import React from 'react'
import RouteList from 'components/RouteList'
import Menu from './Menu'
import routes from './routes'
import settings from '../../../../settings'

interface Props {
  match: {
    params: {
      campaignId: string
    }
  },
}

const AssessmentsReports: React.FC<Props> = ({
  match: { params: { campaignId } },
}) => (
  <div>
    <Menu prefix={`${settings.urlPrefix}/${campaignId}/assessments_reports`} />
    <RouteList routes={routes} urlPrefix={`${settings.urlPrefix}/:campaignId/assessments_reports`} />
  </div>
)

export default AssessmentsReports
