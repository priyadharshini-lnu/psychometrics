import { Menu } from 'antd'
import RouteList from '~/components/RouteList'
import { PageHeader } from '../../PageHeader'
import Options from './Options'

const routes = [
  { redirect: true, from: '', to: 'options' },
  { path: '/options', component: <Options /> },
]
export default function Reports () {
  return (
    <>
      <PageHeader />
      <div>
        <Menu
          selectedKeys={['/reports/options']}
          mode="horizontal"
          items={[
            {
              key: '/reports/options',
              label: I18n.t('administration.threesixty_campaigns.menu.report.menu.report_options.title'),
            }]}
        />
        <RouteList routes={routes} urlPrefix="" />
      </div>
    </>
  )
}
