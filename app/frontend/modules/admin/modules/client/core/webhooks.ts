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

export const PushWebhookReponseTR = t.type({
  body: t.string,
  headers: t.unknown,
})

export type Webhook = t.TypeOf<typeof WebhookTR>

export const GET_WEBHOOK_REQUEST_DATA = 'campaigns/userAssessments/GET_WEBHOOK_REQUEST_DATA'

export const getWebhookPayload = (campaignId, parentType, parentId, body) => ({
  type: GET_WEBHOOK_REQUEST_DATA,
  request: {
    method: 'get',
    url: `/administration/new_campaigns/${campaignId}/${parentType}/${parentId}/webhook_payload`,
    body: { ...body },
    loader: true,
  },
})
