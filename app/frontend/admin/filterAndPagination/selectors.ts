import { TableConfig, State as TableConfigs } from './interfaces'

export const getTables = (state): TableConfigs => state.tables
export const getTableConfigs = (tableName: string, state): TableConfig => getTables(state)[tableName]
