import React, { Suspense } from 'react'
import { DefaultAntThemeWrapper, PageLoadSpinner } from '~/glint'
import RouteList from '~/components/RouteList'
import routes from './routes'
import settings from './settings'

export const Layout: React.FC = () => (
  <Suspense fallback={(
    <DefaultAntThemeWrapper>
      <PageLoadSpinner size="large" />
    </DefaultAntThemeWrapper>
)}
  >
    <RouteList routes={routes} urlPrefix={settings.urlPrefix} />
  </Suspense>
)
