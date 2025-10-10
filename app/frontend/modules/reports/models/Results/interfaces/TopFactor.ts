export enum TopFactorType {
  Any = 1,
  Factor = 2,
  SubFactor = 3,
}

export interface JobRole {
  included: boolean
  expected_proficiency?: number
}

export interface JobRoles {
  current_job_role?: JobRole
  target_job_role?: JobRole
}

export default interface TopFactor {
  meanRawScore: number
  meanNormScore: number
  id: number
  alias: string
  description: string
  icon: string
  jobRoles?: JobRoles
}
