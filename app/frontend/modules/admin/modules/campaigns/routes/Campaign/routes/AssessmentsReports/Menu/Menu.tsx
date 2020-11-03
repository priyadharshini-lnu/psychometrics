import React from 'react'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import { Menu as AntMenu, Button } from 'antd'
import routeUtils from 'utils/route'
import { PlusOutlined } from '@ant-design/icons'
import routes from '../routes'
import styles from './styles.scss'
import { PropsFromRedux } from './connect'

const { I18n } = window

const SEQUENCING = '/sequencing'

interface OwnProps {
  prefix?: string
}

interface Params {
  projectId: string
  campaignId: string
  id: string
}

const Menu: React.FC<OwnProps & RouteComponentProps<Params> & PropsFromRedux> = ({
  history, prefix, openModal, match: { params: { campaignId } },
}) => {
  const onSelect = ({ key }) => routeUtils.moveTo(history, prefix, key)

  return (
    <div className="position-relative">
      <AntMenu
        className="mbm"
        onSelect={onSelect}
        selectedKeys={[routeUtils.getActiveRoutePath(routes)]}
        mode="horizontal"
      >
        <AntMenu.Item key="/manage">
          {I18n.t('assessments_reports.menu.manage')}
        </AntMenu.Item>
        <AntMenu.Item key="/sequencing">
          {I18n.t('assessments_reports.menu.sequencing')}
        </AntMenu.Item>
      </AntMenu>
      {location.pathname.includes(SEQUENCING) && (
      <div className={styles.addGroup}>
        <Button type="primary" onClick={() => openModal('GroupFormModal', { campaignId })}>
          <PlusOutlined />
          <span>{I18n.t('assessments_reports.sequencing.add_group')}</span>
        </Button>
      </div>
      )}
    </div>
  )
}

export default withRouter(Menu)
