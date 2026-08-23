import { FC } from 'react'
import { ConfigProvider, Tabs, theme } from 'antd'
import { useParams } from 'react-router-dom'
import { Settings, TableRows } from '@thetalententerprise/glint/icons'
import { ParentResourceType } from '~/modules/admin/modules/SheetManagement/interfaces'
import { Sheet } from './Sheet'
import { SheetSettings } from './SheetSettings'
import { SheetType } from './core/list'

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
  const { token } = theme.useToken()

  const tabStripTheme = {
    components: {
      Tabs: {
        horizontalMargin: '0',
        horizontalItemPadding: `${token.paddingSM}px ${token.padding}px`,
        horizontalItemGutter: 0,
      },
    },
  }

  let resourceId = parentResourceId
  if (parentResourceType === ParentResourceType.Project && projectId) {
    resourceId = parseInt(projectId, 10)
  } else if (!parentResourceId && parentResourceType === ParentResourceType.Campaign && campaignId) {
    resourceId = parseInt(campaignId, 10)
  }

  if (!resourceId) { return null }

  const items = [
    {
      key: 'rows',
      icon: <TableRows />,
      label: I18n.t('admin.sheets_tabs_rows'),
      children: <Sheet parentResourceType={parentResourceType} parentResourceId={resourceId} />,
    },
    {
      key: 'settings',
      icon: <Settings />,
      label: I18n.t('admin.sheets_tabs_settings'),
      children: (
        <SheetSettings
          parentResourceType={parentResourceType}
          parentResourceId={resourceId}
          sheetType={SheetType.Datasheet}
        />
      ),
    },
  ]

  return (
    <ConfigProvider theme={tabStripTheme}>
      <Tabs defaultActiveKey="rows" destroyOnHidden items={items} />
    </ConfigProvider>
  )
}

export const SheetTabs = SheetTabsComponent
