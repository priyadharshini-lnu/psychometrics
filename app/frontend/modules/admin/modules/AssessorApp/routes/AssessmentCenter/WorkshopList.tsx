import React from 'react'
import { Tabs } from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
import { CampaignsList } from './CampaignsList'
import { ParticipantsList } from './ParticipantsList'

const { I18n } = window

export const WorkshopList: React.FC = () => {
  const { tab } = useParams<{ tab: string }>()
  const navigate = useNavigate()

  const handleTabChange = (activeKey: string) => {
    navigate({
      pathname: `../${activeKey}`,
    }, { relative: 'path' })
  }

  const tabItems = [
    {
      key: 'campaigns',
      label: I18n.t('admin.campaigns_tab'),
      children: <CampaignsList />,
    },
    {
      key: 'participants',
      label: I18n.t('admin.participants_tab'),
      children: <ParticipantsList />,
    },
  ]

  return (
    <>
      <title>
        {`${I18n.t('assessments_reports.menu.assessment_center')} - ${I18n.t('frontend.lighthouse_app')}`}
      </title>
      <Tabs
        className="m-4"
        defaultActiveKey="campaigns"
        activeKey={tab}
        items={tabItems}
        onChange={handleTabChange}
      />
    </>
  )
}
