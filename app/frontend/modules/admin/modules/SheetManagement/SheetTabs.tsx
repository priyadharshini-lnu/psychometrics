import { FC } from 'react'
import { Tabs } from 'antd'
import { useParams } from 'react-router-dom'
import { ParentResourceType } from '~/modules/admin/modules/SheetManagement/interfaces'
import { Sheet } from './Sheet'
import { SheetSettings } from './SheetSettings'
import { SheetType } from './core/list'

const { TabPane } = Tabs
const { I18n } = window

interface Props {
  parentResourceType: ParentResourceType
  parentResourceId?: number
}

const SheetTabsComponent: FC<Props> = ({ parentResourceType, parentResourceId }) => {
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
    <Tabs defaultActiveKey="rows" tabBarStyle={{ padding: '0 20px' }} destroyOnHidden>
      <TabPane
        tab={(
          <span>
            {I18n.t('admin.sheets_tabs_rows')}
          </span>
        )}
        key="rows"
      >
        <Sheet
          parentResourceType={parentResourceType}
          parentResourceId={resourceId}
        />
      </TabPane>
      <TabPane
        tab={(
          <span>
            {I18n.t('admin.sheets_tabs_settings')}
          </span>
          )}
        key="settings"
      >
        <SheetSettings
          parentResourceType={parentResourceType}
          parentResourceId={resourceId}
          sheetType={SheetType.Datasheet}
        />
      </TabPane>
    </Tabs>
  )
}

export const SheetTabs = SheetTabsComponent
