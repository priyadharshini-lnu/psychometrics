import * as t from 'io-ts'

export const WebhookTR = t.type({
  id: t.string,
  projectId: t.number,
  url: t.string,
  active: t.boolean,
  description: t.string,
  createdAt: t.string,
  updatedAt: t.string,
  topics: t.array(t.string),
  authType: t.string,
  username: t.union([t.string, t.undefined, t.null]),
})

export type Webhook = t.TypeOf<typeof WebhookTR>
