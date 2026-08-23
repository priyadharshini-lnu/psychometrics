import React, { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { PageFallback } from '~/components/PageFallback'
import { Navigation } from './Navigation'

const Campaign: React.FC = () => (
  <div>
    {/* Publishes the section nav into the shell's rail; mounted here so a tab swap never unregisters it. */}
    <Navigation />
    <section data-testid="admin_campaign_section">
      {/* Tabs claimed by both campaign types pick their page with React.lazy, so they suspend here. */}
      <Suspense fallback={<PageFallback />}>
        <Outlet />
      </Suspense>
    </section>
  </div>
)

export default Campaign
