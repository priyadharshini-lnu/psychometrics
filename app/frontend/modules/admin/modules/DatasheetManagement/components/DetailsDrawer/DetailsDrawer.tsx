import React, {
  FC, useEffect,
} from 'react'
import {
  Drawer,
} from 'antd'
import { connect, ConnectedProps } from 'react-redux'

import { RootState } from 'modules/admin/core/rootReducers'
import {
  DrawerModes,
  ToggleDrawer,
  ParentResourceType,
  DrawerDataRecord,
} from 'modules/admin/modules/DatasheetManagement/interfaces'

import {
  getCurrent,
  fetchSingle,
  FETCH_SINGLE,
  DataSheetDetail,
} from 'modules/admin/modules/DatasheetManagement/core/current'
import { isRequestInProgress } from 'modules/admin/core/request'

import { DetailsSection, HeaderSection } from './Sections'

const { I18n } = window

const connector = connect(
  (state: RootState) => ({
    datasheetDetails: getCurrent(state),
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
  currentDatasheetId: string
  parentResourceType: ParentResourceType
  parentResourceId: number
}

type PropsFromRedux = ConnectedProps<typeof connector>

type Props = OwnProps & PropsFromRedux

const DetailsDrawerComponent: FC<Props> = ({
  isOpen,
  toggleDrawer,
  editPermission,
  currentDatasheetId,
  datasheetDetails,
  isFetching,
  parentResourceType,
  parentResourceId,
  fetchSingle,
}) => {
  if (!currentDatasheetId) {
    return null
  }

  useEffect(() => {
    fetchSingle(parentResourceType, parentResourceId, currentDatasheetId)
  }, [currentDatasheetId])

  const transformToDrawerDataRecord = (
    dataRecord: DataSheetDetail | undefined,
  ): DrawerDataRecord[] => {
    if (dataRecord) {
      const drawerDataRecord = dataRecord.columns.map((column) => {
        const value = dataRecord.record[column.id]
        return { value, type: column.type, name: column.id }
      })

      return drawerDataRecord
    }
    return []
  }

  const projectDatasheet: DataSheetDetail | undefined = datasheetDetails.find(
    datasheet => datasheet.type === 'project',
  )

  const currentProjectDatasheet = transformToDrawerDataRecord(
    projectDatasheet,
  )

  const campaignDatasheet: DataSheetDetail | undefined = datasheetDetails.find(
    datasheet => datasheet.type === ParentResourceType.Campaign,
  )
  const currentCampaignDatasheet = transformToDrawerDataRecord(
    campaignDatasheet,
  )

  return (
    <Drawer
      title={I18n.t('administration.datasheets.drawers.view.title')}
      placement="right"
      closable
      onClose={() => toggleDrawer(DrawerModes.None)}
      visible={isOpen}
      width="40%"
    >
      {parentResourceType === ParentResourceType.Campaign && (
        <>
          <HeaderSection
            title={I18n.t(
              'administration.datasheets.drawers.view.campaign_title',
            )}
            isFetching={isFetching}
            toggleDrawer={toggleDrawer}
            currentDatasheetId={currentDatasheetId}
            allowEdit
          />
          <DetailsSection
            isFetching={isFetching}
            dataRecord={currentCampaignDatasheet}
          />
        </>
      )}
      <HeaderSection
        title={I18n.t('administration.datasheets.drawers.view.project_title')}
        isFetching={isFetching}
        toggleDrawer={toggleDrawer}
        currentDatasheetId={currentDatasheetId}
        allowEdit={parentResourceType === ParentResourceType.Project && editPermission}
      />
      <DetailsSection
        isFetching={isFetching}
        dataRecord={currentProjectDatasheet}
      />
    </Drawer>
  )
}

export const DetailsDrawer = connector(DetailsDrawerComponent)
