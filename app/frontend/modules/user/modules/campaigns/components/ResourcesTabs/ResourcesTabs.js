import React, { useState } from 'react'
import {
  Tabs,
} from 'antd'
import ResourceList from '../ResourceList'

const { TabPane } = Tabs

export default function ResourcesTabs ({
  assessment, children, ...props
}) {
  if (!assessment.resources_content.length) { return children }

  const [tab, setTab] = useState('assessment')

  return (
    <Tabs defaultActiveKey={tab} className="tabs-row" onChange={setTab}>
      <TabPane tab="Assessment" key="assessment">
        {tab === 'assessment' && children}
      </TabPane>
      <TabPane tab="Background Reading" key="resources">
        {tab === 'resources' && <ResourceList assessment={assessment} {...props} />}
      </TabPane>
    </Tabs>
  )
}
