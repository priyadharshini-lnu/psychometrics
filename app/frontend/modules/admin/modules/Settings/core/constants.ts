export interface MaintenanceSubsystem {
  key: string
  labelKey: string
}

export const MAINTENANCE_SUBSYSTEMS: MaintenanceSubsystem[] = [
  {
    key: 'proctoring',
    labelKey: 'admin.proctoring',
  },
]
