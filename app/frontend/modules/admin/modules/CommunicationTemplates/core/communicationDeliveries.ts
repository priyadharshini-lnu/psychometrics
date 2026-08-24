import * as t from 'io-ts'
import { ResourceIdentifierTR } from '~/modules/admin/core/types/resource'

const CommunicationTemplateRefTR = t.union([
  t.type({
    id: t.string,
    name: t.union([t.string, t.undefined]),
    kind: t.union([t.string, t.undefined]),
  }),
  t.undefined,
])

export const CommunicationDeliveryTR = t.intersection([
  ResourceIdentifierTR,
  t.type({
    triggerType: t.string,
    status: t.union([t.string, t.null]),
    deliveryRule: t.union([t.string, t.null]),
    recipients: t.union([t.string, t.null]),
    deliveryAt: t.union([t.string, t.null]),
    deliveryIntervalNumber: t.union([t.number, t.null]),
    deliveryIntervalPeriod: t.union([t.string, t.null]),
    deliveryStartDate: t.union([t.string, t.null]),
    deliveryEndDate: t.union([t.string, t.null]),
    deliveryTimeOfDay: t.union([t.string, t.null]),
    deliveryTimezone: t.union([t.string, t.null]),
    deliveryFrequency: t.union([t.string, t.null]),
    deliveryWeekdays: t.union([t.array(t.string), t.null]),
    deliveryDelayHours: t.union([t.number, t.null]),
    assessmentCompletionStatusCode: t.union([t.string, t.null]),
    campaignAssessmentGroupId: t.union([t.number, t.null]),
    subject: t.union([t.string, t.null]),
    body: t.union([t.string, t.null]),
    availableLocales: t.union([t.array(t.string), t.undefined]),
    emailsCount: t.union([t.number, t.undefined]),
    emailsSentCount: t.union([t.number, t.undefined]),
    createdAt: t.union([t.string, t.null]),
    updatedAt: t.union([t.string, t.null]),
    communicationTemplate: CommunicationTemplateRefTR,
  }),
])

export type CommunicationDelivery = t.TypeOf<typeof CommunicationDeliveryTR>

export const DeliverySchema = {
  type: 'communication_deliveries',
  relationships: {
    communication_template: {
      type: 'communication_templates',
    },
    campaign: {
      type: 'campaigns',
    },
    project: {
      type: 'clients',
    },
  },
}
