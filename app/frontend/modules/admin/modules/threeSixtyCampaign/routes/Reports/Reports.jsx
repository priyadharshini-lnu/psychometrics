import { Menu } from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ReportApprovalSetting,
} from './ReportApprovalSetting'
import RouteList from '~/components/RouteList'
import { PageHeader } from '../../PageHeader'
import Options from './Options'

const routes = [
  { redirect: true, from: '', to: 'options' },
  { path: '/options', component: <Options /> },
  { path: '/report_approval', component: <ReportApprovalSetting /> },
]
export default function Reports () {
  const navigate = useNavigate()
  const params = useParams()
  const selectedKey = params['*']

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
          selectedKeys={[selectedKey]}
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
        <RouteList routes={routes} urlPrefix="" />
      </div>
    </>
  )
}
