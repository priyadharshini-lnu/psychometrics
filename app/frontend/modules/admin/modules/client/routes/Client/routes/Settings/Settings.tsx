import React from 'react'
import { Tabs } from 'antd'
import { Siem } from './Siem'

const { TabPane } = Tabs

const { I18n } = window

export const Settings: React.FC = () => (
  <Tabs defaultActiveKey="siem" tabBarStyle={{ padding: '0 20px' }} destroyInactiveTabPane>
    <TabPane
      tab={(
        <span>
          {I18n.t('administration.settings.tabs.siem')}
        </span>
        )}
      key="siem"
    >
      <Siem />
    </TabPane>
  </Tabs>
)
