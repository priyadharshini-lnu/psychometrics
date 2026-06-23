import { FC, useEffect } from 'react'
import {
  Drawer,
} from 'antd'
import { connect, ConnectedProps } from 'react-redux'

import { RootState } from '~/modules/admin/core/rootReducers'
import {
  DrawerModes,
  ToggleDrawer,
  ParentResourceType,
  DrawerDataRecord,
} from '~/modules/admin/modules/SheetManagement/interfaces'

import {
  getCurrent,
  fetchSingle,
  FETCH_SINGLE,
  SheetDetail,
} from '~/modules/admin/modules/SheetManagement/core/current'
import { isRequestInProgress } from '~/core/request'

import { DetailsSection, HeaderSection } from './Sections'
import { ColumnType, SheetType } from '../../core/list'

const { I18n } = window

const connector = connect(
  (state: RootState) => ({
    sheetDetails: getCurrent(state),
    isFetching: isRequestInProgress(state, FETCH_SINGLE),
  }),
  {
    fetchSingle,
  },
)

interface OwnProps {
  isOpen: boolean
  toggleDrawer: ToggleDrawer
  editPermission: boolean
  currentSheetRowId: string
  parentResourceType: ParentResourceType
  parentResourceId: number
  sheetType: SheetType
}

type PropsFromRedux = ConnectedProps<typeof connector>

type Props = OwnProps & PropsFromRedux

const DetailsDrawerComponent: FC<Props> = ({
  isOpen,
  toggleDrawer,
  editPermission,
  currentSheetRowId,
  sheetDetails,
  isFetching,
  parentResourceType,
  parentResourceId,
  fetchSingle,
  sheetType,
}) => {
  if (!currentSheetRowId) {
    return null
  }

  useEffect(() => {
    fetchSingle(parentResourceType, parentResourceId, sheetType, currentSheetRowId)
  }, [currentSheetRowId])

  const transformToDrawerDataRecord = (
    dataRecord: SheetDetail | undefined,
  ): DrawerDataRecord[] => {
    if (dataRecord) {
      const drawerDataRecord = dataRecord.columns.map((column): DrawerDataRecord => {
        const value = dataRecord.record[column.name]
        return { value, column_type: column.column_type as ColumnType, name: column.name }
      })

      return drawerDataRecord
    }
    return []
  }

  const projectSheet: SheetDetail | undefined = sheetDetails.find(
    sheet => sheet.type === 'project',
  )

  const currentProjectSheet = transformToDrawerDataRecord(
    projectSheet,
  )

  const campaignSheet: SheetDetail | undefined = sheetDetails.find(
    sheet => sheet.type === ParentResourceType.Campaign,
  )
  const currentCampaignSheet = transformToDrawerDataRecord(
    campaignSheet,
  )

  return (
    <Drawer
      title={I18n.t('admin.sheets_drawers_view_title')}
      placement="right"
      closable
      onClose={() => toggleDrawer(DrawerModes.None)}
      open={isOpen}
      width="40%"
    >
      {parentResourceType === ParentResourceType.Campaign && (
        <>
          <HeaderSection
            title={I18n.t(
              'admin.sheets_drawers_view_campaign_title',
            )}
            isFetching={isFetching}
            toggleDrawer={toggleDrawer}
            currentSheetRowId={currentSheetRowId}
            allowEdit={editPermission}
          />
          <DetailsSection
            isFetching={isFetching}
            dataRecord={currentCampaignSheet}
          />
        </>
      )}
      {sheetType === SheetType.Datasheet
      && (
        <>
          <HeaderSection
            title={I18n.t('admin.sheets_drawers_view_project_title')}
            isFetching={isFetching}
            toggleDrawer={toggleDrawer}
            currentSheetRowId={currentSheetRowId}
            allowEdit={parentResourceType === ParentResourceType.Project && editPermission}
          />
          <DetailsSection
            isFetching={isFetching}
            dataRecord={currentProjectSheet}
          />
        </>
      )}
    </Drawer>
  )
}

export const DetailsDrawer = connector(DetailsDrawerComponent)
