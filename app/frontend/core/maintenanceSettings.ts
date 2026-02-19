import * as t from 'io-ts'

export const MaintenanceSettingTR = t.type({
  subSystem: t.string,
  maintenanceWindowEnabled: t.boolean,
  timeZone: t.string,
  startTime: t.union([t.string, t.null]),
  endTime: t.union([t.string, t.null]),
  active: t.boolean,
  maintenanceDuration: t.union([t.number, t.undefined]),
})

export type MaintenanceSetting = t.TypeOf<typeof MaintenanceSettingTR>

export const MaintenanceSettingsTR = t.array(MaintenanceSettingTR)

export type MaintenanceSettings = t.TypeOf<typeof MaintenanceSettingsTR>

const defaultState: MaintenanceSettings = []

const maintenanceSettings = (
  state: MaintenanceSettings = defaultState,
): MaintenanceSettings => state

export default maintenanceSettings
