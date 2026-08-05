import React from 'react'
import { useRoutes } from 'react-router-dom'
import routes from './routes'

const Campaign: React.FC = () => {
  const routedPage = useRoutes(routes)

  return (
    <div>
      <section data-testid="admin_campaign_section">
        {routedPage}
      </section>
    </div>
  )
}

export default Campaign
