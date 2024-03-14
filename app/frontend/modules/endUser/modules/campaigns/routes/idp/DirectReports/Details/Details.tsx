import { useState } from 'react'
import { Tabs, Typography } from 'antd'

import { BoxWithShadow } from '~/glint'
import { Plan } from './Plan/Plan'
import { SkillGapReport } from './SkillGapReport/SkillGapReport'

const { I18n } = window

export const DirectReportDetails = () => {
  const [tab, setTab] = useState('list') // TODO: add url switching on change
  return (
    <div style={{ padding: 80 }}>
      <Typography.Title level={4}>DirectReportDetails</Typography.Title>
      <BoxWithShadow style={{ padding: '16px', marginTop: 16, minHeight: 100 }}>
        Profile info Placeholder
      </BoxWithShadow>

      <Tabs activeKey={tab} onChange={tab => setTab(tab)}>
        <Tabs.TabPane tab={I18n.t('idp.plan')} key="list">
          <Plan />
        </Tabs.TabPane>
        <Tabs.TabPane tab={I18n.t('idp.skill_gap_report')} key="skill_gap_report">
          <SkillGapReport />
        </Tabs.TabPane>
      </Tabs>
    </div>
  )
}
