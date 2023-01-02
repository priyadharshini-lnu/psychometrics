import * as t from 'io-ts'


export const TaskTR = t.type({
  id: t.string,
  approvalStatus: t.string,
  qcUserIds: t.array(t.number),
  approverUserIds: t.array(t.number),
  projectId: t.number,
  pdfUrl: t.union([t.string, t.null]),
  campaign: t.type({
    id: t.string,
  }),
  user: t.type({
    id: t.string,
  }),
  report: t.type({
    id: t.string,
  }),
})

export type Task = t.TypeOf<typeof TaskTR>

export const Schema = {
  type: 'report_approvals',
  relationships: {
    user: {
      type: 'users',
    },
    report: {
      type: 'reports',
    },
    campaign: {
      type: 'campaigns',
    },
  },
}
