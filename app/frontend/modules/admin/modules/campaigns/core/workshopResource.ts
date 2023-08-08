import * as t from 'io-ts'

export const WorkshopResourceTR = t.type({
  id: t.string,
  name: t.string,
  url: t.string,
  workshopId: t.number,
})

export const Schema = {
  type: 'workshop_resources',
  relationships: {
    workshop: {
      type: 'workshops',
    },
  },
}

export type WorkshopResource = t.TypeOf<typeof WorkshopResourceTR>
