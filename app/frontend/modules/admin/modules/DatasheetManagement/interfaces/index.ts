import { ColumnType } from 'modules/admin/modules/DatasheetManagement/core/list'

export enum ParentResourceType {
  Project = 'project',
  Campaign = 'new_campaign'
}

export enum DrawerModes {
  Add = 'addDatasheetDrawer',
  Edit = 'editDatasheetDrawer',
  Details = 'detailsDatasheetDrawer',
  None = 'noDatasheetDrawer'
}

export type ToggleDrawer = (mode: DrawerModes, id?: string) => void

export type DrawerDataRecord = {
  name: string,
  value: string | number | null,
  type: ColumnType
}
