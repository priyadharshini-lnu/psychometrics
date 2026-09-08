import React, { useEffect, useRef, useState } from 'react'
import { Tabs, Typography } from '@thetalententerprise/glint'
import { useAssessorAppTour } from '../AssessorAppTour'
import ParticipantList from './ParticipantList'
import CampaignList from './CampaignList'
import { TOUR_CONFIG_KEY } from '../../../context/consts'

const { I18n } = window

const AssessorEvaluation: React.FC = () => {
  const [activeTab, setActiveTab] = useState('byParticipant')
  const tabsRef = useRef<HTMLDivElement>(null)
  const tableRef = useRef<HTMLDivElement>(null)
  const { registerTour, unregisterTour } = useAssessorAppTour()

  const getTabList = () => tabsRef.current?.querySelector<HTMLElement>('[role="tablist"]') ?? null
  const getProfileDropdown = () => document.querySelector<HTMLElement>('[data-tour="profile-dropdown"]') ?? null

  useEffect(() => {
    registerTour({
      configKey: TOUR_CONFIG_KEY,
      ready: getTabList() != null && tableRef.current != null,
      steps: [
        {
          title: I18n.t('admin.assessor_evaluation_tour_profile_title'),
          description: I18n.t('admin.assessor_evaluation_tour_profile_description'),
          target: getProfileDropdown(),
          placement: 'bottomRight',
        },
        {
          title: I18n.t('admin.assessor_evaluation_tour_tabs_title'),
          description: I18n.t('admin.assessor_evaluation_tour_tabs_description'),
          target: getTabList(),
          placement: 'bottom',
        },
        {
          title: I18n.t('admin.assessor_evaluation_tour_table_title'),
          description: I18n.t('admin.assessor_evaluation_tour_table_description'),
          target: tableRef.current,
          placement: 'bottom',
        },
      ],
    })

    return () => unregisterTour(TOUR_CONFIG_KEY)
  }, [activeTab, registerTour, unregisterTour])

  const tabItems = [
    {
      key: 'byParticipant',
      label: I18n.t('admin.assessor_evaluation_by_participant'),
      children: <div ref={tableRef}><ParticipantList /></div>,
    },
    {
      key: 'byCampaign',
      label: I18n.t('admin.assessor_evaluation_by_campaign'),
      children: <div ref={tableRef}><CampaignList /></div>,
    },
  ]

  return (
    <>
      <title>
        {`${I18n.t('admin.assessor_evaluation')} - ${I18n.t('frontend.lighthouse_app')}`}
      </title>
      <Typography.Title className="ps-6 pt-6" level={4}>
        {I18n.t('admin.assessor_evaluation')}
      </Typography.Title>
      <div ref={tabsRef}>
        <Tabs
          classNames={{
            header:
            'ps-6 pe-6',
          }}
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
        />
      </div>
    </>
  )
}

export default AssessorEvaluation
