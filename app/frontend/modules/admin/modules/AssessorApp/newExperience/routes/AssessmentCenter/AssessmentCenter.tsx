import React, { useState } from 'react'
import { Tabs } from '@thetalententerprise/glint'
import { CampaignsList } from './CampaignsList'
import { ParticipantsList } from './ParticipantsList'

const { I18n } = window


const AssessmentCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState('campaigns')

  const tabItems = [
    {
      key: 'campaigns',
      label: I18n.t('admin.campaigns_tab'),
      children: activeTab === 'campaigns' ? <CampaignsList /> : null,
    },
    {
      key: 'participants',
      label: I18n.t('admin.participants_tab'),
      children: activeTab === 'participants' ? <ParticipantsList /> : null,
    },
  ]

  return (
    <>
      <title>
        {`${I18n.t('assessments_reports.menu.assessment_center')} - ${I18n.t('frontend.lighthouse_app')}`}
      </title>
      <Tabs
        classNames={{ header: 'ps-6 pe-6' }}
        defaultActiveKey="campaigns"
        activeKey={activeTab}
        items={tabItems}
        onChange={setActiveTab}
      />
    </>
  )
}

export default AssessmentCenter
