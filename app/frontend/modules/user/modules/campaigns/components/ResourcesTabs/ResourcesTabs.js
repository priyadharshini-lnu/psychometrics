import React from 'react'
import {
  Tabs,
} from 'antd'
import ResourceList from '../ResourceList'

const { TabPane } = Tabs

export default function ResourcesTabs ({
  assessment, children, ...props
}) {
  if (!assessment.resources_content.length) { return children }

  return (
    <Tabs defaultActiveKey="assessment" className="tabs-row">
      <TabPane tab="Assessment" key="assessment">
        {children}
      </TabPane>
      <TabPane tab="Background Reading" key="resources">
        <ResourceList assessment={assessment} {...props} />
      </TabPane>
    </Tabs>
  )
}
