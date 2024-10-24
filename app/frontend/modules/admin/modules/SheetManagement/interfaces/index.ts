import { ColumnType } from '~/modules/admin/modules/SheetManagement/core/list'

export enum ParentResourceType {
  Project = 'project',
  Campaign = 'new_campaign'
}

export enum DrawerModes {
  Add = 'addSheetDrawer',
  Edit = 'editSheetDrawer',
  Details = 'detailsSheetDrawer',
  None = 'noSheetDrawer'
}

export type ToggleDrawer = (mode: DrawerModes, id?: string) => void

export type DrawerDataRecord = {
  name: string,
  value: string | number | null,
  column_type: ColumnType
}
