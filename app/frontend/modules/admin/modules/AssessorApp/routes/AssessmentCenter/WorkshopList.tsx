import React from 'react'
import { Menu } from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
import { Campaign, Person } from '@thetalententerprise/glint/icons'
import { CampaignsList } from './CampaignsList'
import { ParticipantsList } from './ParticipantsList'
import { DocumentTitle } from '~/components/DocumentTitle'

const { I18n } = window

export const WorkshopList: React.FC = () => {
  const { tab } = useParams<{ tab: string }>()
  const navigate = useNavigate()

  const onSelect = ({ key }) => {
    navigate({
      pathname: `../${key}`,
    }, { relative: 'path' })
  }

  const menuItems = [
    {
      key: 'campaigns',
      icon: <Campaign />,
      label: I18n.t('admin.campaigns_tab'),
    },
    {
      key: 'participants',
      icon: <Person />,
      label: I18n.t('admin.participants_tab'),
    },
  ]

  return (
    <>
      <DocumentTitle text={I18n.t('assessments_reports.menu.assessment_center')} />
      <Menu
        items={menuItems}
        onSelect={onSelect}
        selectedKeys={tab ? [tab] : []}
        mode="horizontal"
      />
      {tab === 'participants' ? <ParticipantsList /> : <CampaignsList />}
    </>
  )
}
