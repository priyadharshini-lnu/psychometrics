import React from 'react'
import RouteList from '~/components/RouteList'
import routes from './routes'

const Campaign: React.FC = () => (
  <div>
    <section data-testid="admin_campaign_section">
      <RouteList
        routes={routes}
        urlPrefix=""
      />
    </section>
  </div>
)

export default Campaign
