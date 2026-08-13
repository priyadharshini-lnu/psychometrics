import { Menu } from 'antd'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { PageHeader } from '../../PageHeader'
import { TABS } from './routes'

export default function Reports () {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const selectedKey = TABS.find(tab => pathname.endsWith(`/${tab}`))

  const goto = (key) => {
    navigate(
      `${key}`,
    )
  }
  return (
    <>
      <PageHeader />
      <div>
        <Menu
          selectedKeys={selectedKey ? [selectedKey] : []}
          onSelect={({ key }) => goto(key)}
          mode="horizontal"
          items={[
            {
              key: 'options',
              label: I18n.t('admin.threesixty_campaigns_menu_report_menu_report_options_title'),
            },
            {
              key: 'report_approval',
              label: I18n.t('admin.threesixty_campaigns_menu_report_menu_report_approval_title'),
            },
          ]}
        />
        <Outlet />
      </div>
    </>
  )
}
