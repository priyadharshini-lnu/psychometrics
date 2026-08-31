import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Col, Menu, Row, useGlintToken,
} from '@thetalententerprise/glint'
import { Password, Person } from '@thetalententerprise/glint/icons'
import { DocumentTitle } from '~/components/DocumentTitle'

const { I18n } = window

function ProfileLayout () {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const token = useGlintToken()

  const items = [
    {
      key: 'details',
      icon: <Person />,
      label: I18n.t('admin.profile_details'),
    },
    {
      key: 'change_password',
      icon: <Password />,
      label: I18n.t('admin.profile_change_password'),
    },
  ]
  const activeItem = items.find(item => pathname.endsWith(`/${item.key}`)) || items[0]

  return (
    <>
      <DocumentTitle text={activeItem.label} />
      {/* No PageContainer: it hard-codes 24px of padding on every side, so the strip cannot sit at the top. */}
      <Menu
        items={items}
        selectedKeys={[activeItem.key]}
        onSelect={({ key }) => navigate(key)}
        mode="horizontal"
      />
      <Row style={{ paddingInline: token.paddingLG, paddingBlock: token.paddingLG }}>
        <Col xs={24} md={20} lg={14} xxl={10}>
          <Outlet />
        </Col>
      </Row>
    </>
  )
}

export default ProfileLayout
