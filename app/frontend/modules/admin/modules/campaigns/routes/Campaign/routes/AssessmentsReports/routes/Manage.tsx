import React, { useState } from 'react'
import {
  Tabs,
} from 'antd'
import { useParams, useHistory } from 'react-router-dom'
import AssessmentsReports from './AssessmentsReports'
import { Idp } from './Idp'
import styles from './Manage.less'

const { I18n } = window

const Manage: React.FC<{}> = () => {
  const { projectId, campaignId, tab: paramTab } = useParams<{projectId:string, campaignId:string, tab:string}>()
  const history = useHistory()
  const [tab, setTab] = useState(paramTab || 'assessments')

  const changeTab = (tab) => {
    history.push(`/admin/projects/${projectId}/new_campaigns/${campaignId}/assessments_reports/manage/${tab}`)

    setTab(tab)
  }

  return (
    <div>
      <Tabs
        activeKey={tab}
        onChange={changeTab}
        defaultActiveKey="assessments"
        className={styles.tabs}
        items={[
          {
            key: 'assessments',
            label: I18n.t('assessments_reports.menu.assessments_and_reports'),
            children: <AssessmentsReports />,
          },
          {
            key: 'idp',
            label: I18n.t('assessments_reports.menu.idp'),
            children: <Idp />,
          },
        ]}
      />
    </div>
  )
}

export default Manage
