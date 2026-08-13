import React, { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { PageFallback } from '~/components/PageFallback'

// Chrome only: the tabs are static children of the admin campaign route, so the router fills this outlet.
const Campaign: React.FC = () => (
  <div>
    <section data-testid="admin_campaign_section">
      {/* Tabs claimed by both campaign types pick their page with React.lazy, so they suspend here. */}
      <Suspense fallback={<PageFallback />}>
        <Outlet />
      </Suspense>
    </section>
  </div>
)

export default Campaign
