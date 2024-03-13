import React, { Suspense } from 'react'
import RouteList from '~/components/RouteList'
import routes from './routes'
import settings from './settings'

export const Layout: React.FC = () => (
  <Suspense fallback={<div>Loading Page...</div>}>
    <RouteList routes={routes} urlPrefix={settings.urlPrefix} />
  </Suspense>
)
