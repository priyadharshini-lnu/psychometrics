import { Menu } from 'antd'

import RouteList from '~/components/RouteList'
import routeUtils from '~/utils/route'

import settings from '../../settings'
import { PageHeader } from '../../PageHeader'

export default function Reports ({
  history, routes,
}) {
  const onSelect = ({ key }) => {
    routeUtils.moveTo(history, settings.urlPrefix, key)
  }

  return (
    <>
      <PageHeader />
      <div>
        <Menu
          onSelect={onSelect}
          selectedKeys={[routeUtils.getActiveRoutePath(routes)]}
          mode="horizontal"
          items={[
            {
              key: '/reports/options',
              label: I18n.t('administration.threesixty_campaigns.menu.report.menu.report_options.title'),
            }]}
        />
        <RouteList routes={routes} urlPrefix={settings.urlPrefix} />
      </div>
    </>
  )
}
