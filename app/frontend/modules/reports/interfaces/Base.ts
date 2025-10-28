import { TableColumn } from '../core/interfaces/TableColumn'
import { JobRoles } from '../models/Results/interfaces'

export interface BaseProps<Type = ''> {
  type: Type extends 'Table'
    ? TypeTables
    : Type extends 'Graph'
    ? TypeGraphs
    : ''
  position: {
    left: number
    top: number
    width: number
    height: number
  }
  style: {
    fontColor: string
    fontSize: string
    fontFamily: string
    backgroundColor: string
    width: string
  }
  colors: Array<{ id: number; color: string }>
  tableColumns?: TableColumn
  defaultTableColumns?: TableColumn
}
export interface Factor {
  id: number
  name: string
  job_roles: JobRoles
}

type TypeTables = 'GapAssessment' | 'Competencies'

type TypeGraphs = 'Bubble' | 'Bar' | 'StackedBar'
