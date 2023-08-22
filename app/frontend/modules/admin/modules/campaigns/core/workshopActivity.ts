import * as t from 'io-ts'

export const WorkshopUserAcitivityTR = t.type({
  id: t.string,
  status: t.string,
  scheduleTime: t.union([t.string, t.null]),
  subject: t.union([
    t.type({
      fullName: t.union([t.string, t.null]),
      email: t.union([t.string, t.null]),
    }),
    t.undefined]),
  evaluator: t.union([
    t.type({
      fullName: t.union([t.string, t.null]),
      email: t.union([t.string, t.null]),
    }),
    t.undefined]),
  assessment: t.type({
    name: t.string,
  }),
})

export const Schema = {
  type: 'user_assessments',
  relationships: {
    evaluator: {
      type: 'users',
    },
    subject: {
      type: 'users',
    },
    assessment: {
      type: 'assessments',
    },
  },
}

export type WorkshopUserAcitivity = t.TypeOf<typeof WorkshopUserAcitivityTR>
