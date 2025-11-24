import * as t from 'io-ts'

export const WorkshopTR = t.type({
  id: t.string,
  startTime: t.string,
  name: t.string,
  duration: t.number,
  campaign: t.type({
    id: t.string,
    name: t.string,
    projectId: t.number,
  }),
})

export const Workshops = {
  type: 'workshops',
  relationships: {
    campaign: {
      type: 'campaign',
    },
    workshop_assessors: {
      type: 'workshop_assessors',
    },
  },
}

export type Workshop = t.TypeOf<typeof WorkshopTR>
