import React, { FC, useState } from 'react'
import { Tabs } from 'antd'
import { ParentResourceType } from 'modules/admin/modules/DatasheetManagement/interfaces'
import { SettingOutlined, DatabaseOutlined } from '@ant-design/icons'
import { useParams } from 'react-router-dom'
import { Datasheet } from './Datasheet'
import { DatasheetSettings } from './DatasheetSettings'

const { TabPane } = Tabs
const { I18n } = window

interface Props {
  parentResourceType: ParentResourceType
}

const DatasheetTabsComponent: FC<Props> = ({ parentResourceType }) => {
  const [tab, setTab] = useState('rows')
  const changeTab = (key) => {
    setTab(key)
  }
  const { campaignId, projectId } = useParams<{
    projectId?: string
    campaignId?: string
  }>()

  let parentResourceId = 0
  if (parentResourceType === ParentResourceType.Project && projectId) {
    parentResourceId = parseInt(projectId, 10)
  } else if (parentResourceType === ParentResourceType.Campaign && campaignId) {
    parentResourceId = parseInt(campaignId, 10)
  }

  if (!parentResourceId) { return null }

  return (
    <Tabs defaultActiveKey="rows" tabBarStyle={{ padding: '0 20px' }} onChange={changeTab}>
      <TabPane
        tab={(
          <span>
            <DatabaseOutlined />
            {I18n.t('administration.datasheets.tabs.rows')}
          </span>
        )}
        key="rows"
      >
        <Datasheet
          parentResourceType={parentResourceType}
          parentResourceId={parentResourceId}
          reload={tab === 'rows'}
        />
      </TabPane>
      <TabPane
        tab={(
          <span>
            <SettingOutlined />
            {I18n.t('administration.datasheets.tabs.settings')}
          </span>
          )}
        key="settings"
      >
        <DatasheetSettings
          parentResourceType={parentResourceType}
          parentResourceId={parentResourceId}
        />
      </TabPane>
    </Tabs>
  )
}

export const DatasheetTabs = DatasheetTabsComponent
