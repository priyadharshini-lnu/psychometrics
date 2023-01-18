import * as t from 'io-ts'

export const ProjectTR = t.type({
  id: t.string,
  name: t.string,
  number: t.string,
  subdomain: t.string,
  createdAt: t.string,
  updatedAt: t.string,
  disabled: t.boolean,
  clientId: t.string,
})

export type Project = t.TypeOf<typeof ProjectTR>
