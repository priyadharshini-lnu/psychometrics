import React from 'react'
import { Tabs } from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
import { CampaignsList } from './CampaignsList'
import { ParticipantsList } from './ParticipantsList'
import { DocumentTitle } from '~/components/DocumentTitle'

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
      <DocumentTitle text={I18n.t('assessments_reports.menu.assessment_center')} />
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
