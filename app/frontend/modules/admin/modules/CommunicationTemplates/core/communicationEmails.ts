import * as t from 'io-ts'
import { ResourceIdentifierTR } from '~/modules/admin/core/types/resource'

export const CommunicationEmailTR = t.intersection([
  ResourceIdentifierTR,
  t.type({
    sentAt: t.union([t.string, t.null]),
    createdAt: t.union([t.string, t.null]),
    recipientName: t.union([t.string, t.null]),
    recipientEmail: t.union([t.string, t.null]),
    subject: t.union([t.string, t.null]),
    status: t.string,
    errorCode: t.union([t.string, t.null]),
    errorMessage: t.union([t.string, t.null]),
    attempts: t.number,
  }),
])

export type CommunicationEmail = t.TypeOf<typeof CommunicationEmailTR>

export const EmailSchema = {
  type: 'communication_emails',
  relationships: {
    communication_delivery: {
      type: 'communication_deliveries',
    },
  },
}
