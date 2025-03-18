import * as t from 'io-ts'

export enum ResourceType {
  ReportApprovalAll = 'report_approvals_all',
  ReportApprovalMyTasks = 'report_approvals_my_tasks',
  ReportApprovalApproved = 'report_approvals_approved',
}

const ResourceTypeTR = t.union([
  t.literal(ResourceType.ReportApprovalAll),
  t.literal(ResourceType.ReportApprovalMyTasks),
  t.literal(ResourceType.ReportApprovalApproved),
])

const FilterParamsTR = t.record(
  t.string,
  t.union([t.array(t.string), t.string]),
)

export const UserSavedFilterTR = t.type({
  id: t.string,
  user_id: t.number,
  name: t.string,
  favorite: t.boolean,
  resourceType: ResourceTypeTR,
  filter_params: FilterParamsTR,
})


export type UserSavedFilter = t.TypeOf<typeof UserSavedFilterTR>

export const Schema = {
  type: 'user_saved_filters',
}
