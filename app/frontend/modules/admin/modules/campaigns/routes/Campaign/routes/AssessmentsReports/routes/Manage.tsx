import React, { useState } from 'react'
import {
  Tabs,
} from 'antd'
import { useParams, useNavigate } from 'react-router-dom'
import { connect, ConnectedProps } from 'react-redux'
import AssessmentsReports from './AssessmentsReports'
import { Idp } from './Idp'
import styles from './Manage.less'
import { getFeatures } from '~/core/config'
import { RootState } from '~/modules/admin/core/rootReducers'

const { I18n } = window

const mapState = (state: RootState) => ({
  features: getFeatures(state),
})

const connector = connect(mapState)

type PropsFromRedux = ConnectedProps<typeof connector>

const Manage: React.FC<PropsFromRedux> = ({ features }) => {
  const { projectId, campaignId, tab: paramTab } = useParams() as { projectId: string, campaignId: string, tab: string }
  const navigate = useNavigate()
  const [tab, setTab] = useState(paramTab || 'assessments')
  const idpEnabled = features.idp_enabled

  const changeTab = (tab) => {
    navigate(`/admin/projects/${projectId}/new_campaigns/${campaignId}/assessments_reports/manage/${tab}`)

    setTab(tab)
  }

  const tabs = [
    {
      key: 'assessments',
      label: I18n.t('assessments_reports.menu.assessments_and_reports'),
      children: <AssessmentsReports />,
    },
  ]

  if (idpEnabled) {
    tabs.push({
      key: 'idp',
      label: I18n.t('assessments_reports.menu.idp'),
      children: <Idp />,
    })
  }

  return (
    <div>
      <Tabs
        activeKey={tab}
        onChange={changeTab}
        defaultActiveKey="assessments"
        className={styles.tabs}
        items={tabs}
      />
    </div>
  )
}

export default connector(Manage)
