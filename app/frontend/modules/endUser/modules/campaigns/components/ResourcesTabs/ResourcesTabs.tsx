import React, { useState } from 'react'
import { Tabs } from 'antd'
import styles from './ResourcesTabs.less'
import { ResourceList } from '../ResourceList'

const { TabPane } = Tabs
const { I18n } = window

export const ResourcesTabs = ({
  assessment, children, assessmentStarted, ...props
}) => {
  if (!assessment.resources_content.length) {
    return children
  }

  const [tab, setTab] = useState('assessment')

  return (
    <Tabs defaultActiveKey={tab} className={styles.tabs} onChange={setTab}>
      <TabPane tab={I18n.t('frontend.assessment')} key="assessment">
        {tab === 'assessment' && children}
      </TabPane>
      {assessmentStarted && (
        <>
          <TabPane tab={I18n.t('frontend.background_reading')} key="resources">
            {tab === 'resources' && <ResourceList assessment={assessment} {...props} />}
          </TabPane>
        </>
      )}
    </Tabs>
  )
}
