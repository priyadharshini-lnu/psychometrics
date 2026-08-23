import React, { useState } from 'react'
import { Menu } from 'antd'
import { useParams, useNavigate } from 'react-router-dom'
import { connect, ConnectedProps } from 'react-redux'
import { Assignment, Explore } from '@thetalententerprise/glint/icons'
import { camelizeKeys } from '~/utils/object'
import AssessmentsReports from './AssessmentsReports'
import { Idp } from './Idp'
import { getFeatures } from '~/core/config'
import { RootState } from '~/modules/admin/core/rootReducers'

const { I18n } = window

const mapState = (state: RootState) => ({
  features: getFeatures(state),
  projectIdpEnabled: state.config.project.idpEnabled,
})

const connector = connect(mapState)

type PropsFromRedux = ConnectedProps<typeof connector>

const Manage: React.FC<PropsFromRedux> = ({ features, projectIdpEnabled }) => {
  const { projectId, campaignId, tab: paramTab } = useParams() as { projectId: string, campaignId: string, tab: string }
  const navigate = useNavigate()
  const [tab, setTab] = useState(paramTab || 'assessments')
  const {
    idpEnabled,
  } = camelizeKeys(features)

  const changeTab = (tab) => {
    navigate(`/admin/projects/${projectId}/new_campaigns/${campaignId}/assessments_reports/manage/${tab}`)

    setTab(tab)
  }

  const menuItems = [
    {
      key: 'assessments',
      icon: <Assignment />,
      label: I18n.t('assessments_reports.menu.assessments_and_reports'),
    },
  ]

  if (idpEnabled && projectIdpEnabled) {
    menuItems.push({
      key: 'idp',
      icon: <Explore />,
      label: I18n.t('assessments_reports.menu.idp'),
    })
  }

  const activeKey = menuItems.some(({ key }) => key === tab) ? tab : 'assessments'

  return (
    <div>
      {menuItems.length > 1 && (
        <Menu
          items={menuItems}
          onSelect={({ key }) => changeTab(key)}
          selectedKeys={[activeKey]}
          mode="horizontal"
        />
      )}
      {activeKey === 'idp' ? <Idp /> : <AssessmentsReports />}
    </div>
  )
}

export default connector(Manage)
