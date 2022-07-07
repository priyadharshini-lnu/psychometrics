import React, { FC, useState } from 'react'
import { Tabs } from 'antd'
import { ParentResourceType } from 'modules/admin/modules/DatasheetManagement/interfaces'
import { useParams } from 'react-router-dom'
import { Datasheet } from './Datasheet'
import { DatasheetSettings } from './DatasheetSettings'

const { TabPane } = Tabs
const { I18n } = window

interface Props {
  parentResourceType: ParentResourceType
  parentResourceId?: number
}

const DatasheetTabsComponent: FC<Props> = ({ parentResourceType, parentResourceId }) => {
  const [tab, setTab] = useState('rows')
  const changeTab = (key) => {
    setTab(key)
  }
  const { campaignId, projectId } = useParams<{
    projectId?: string
    campaignId?: string
  }>()

  let resourceId = parentResourceId
  if (parentResourceType === ParentResourceType.Project && projectId) {
    resourceId = parseInt(projectId, 10)
  } else if (!parentResourceId && parentResourceType === ParentResourceType.Campaign && campaignId) {
    resourceId = parseInt(campaignId, 10)
  }

  if (!resourceId) { return null }

  return (
    <Tabs defaultActiveKey="rows" tabBarStyle={{ padding: '0 20px' }} onChange={changeTab}>
      <TabPane
        tab={(
          <span>
            {I18n.t('administration.datasheets.tabs.rows')}
          </span>
        )}
        key="rows"
      >
        <Datasheet
          parentResourceType={parentResourceType}
          parentResourceId={resourceId}
          reload={tab === 'rows'}
        />
      </TabPane>
      <TabPane
        tab={(
          <span>
            {I18n.t('administration.datasheets.tabs.settings')}
          </span>
          )}
        key="settings"
      >
        <DatasheetSettings
          parentResourceType={parentResourceType}
          parentResourceId={resourceId}
        />
      </TabPane>
    </Tabs>
  )
}

export const DatasheetTabs = DatasheetTabsComponent
