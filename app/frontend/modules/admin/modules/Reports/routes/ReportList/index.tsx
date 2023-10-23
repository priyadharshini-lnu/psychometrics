import React from 'react'
import RouteList from '~/components/RouteList'
import routes from './routes'
import settings from '../../settings'

export const ReportList: React.FC = () => (
  <RouteList routes={routes} urlPrefix={`${settings.urlPrefix}/reports`} />
)
