import * as t from 'io-ts'
import { ResourceIdentifierTR } from '~/modules/admin/core/types/resource'

const ScopeRefTR = t.union([
  t.type({
    id: t.string,
    name: t.union([t.string, t.undefined]),
  }),
  t.undefined,
])

const InheritsFromRefTR = t.union([
  t.type({
    id: t.string,
    level: t.union([t.string, t.undefined]),
    name: t.union([t.string, t.undefined]),
  }),
  t.undefined,
])

export const CommunicationTemplateTR = t.intersection([
  ResourceIdentifierTR,
  t.type({
    name: t.string,
    kind: t.string,
    level: t.string,
    status: t.union([t.string, t.null]),
    recipientsDefault: t.union([t.string, t.null]),
    subject: t.union([t.string, t.null]),
    body: t.union([t.string, t.null]),
    availableLocales: t.union([t.array(t.string), t.undefined]),
    deliveryDefaults: t.union([t.record(t.string, t.unknown), t.null]),
    createdAt: t.union([t.string, t.null]),
    updatedAt: t.union([t.string, t.null]),
    client: ScopeRefTR,
    project: ScopeRefTR,
    campaign: ScopeRefTR,
    inheritsFrom: InheritsFromRefTR,
  }),
])

export type CommunicationTemplate = t.TypeOf<typeof CommunicationTemplateTR>

export const Schema = {
  type: 'communication_templates',
  relationships: {
    client: {
      type: 'clients',
    },
    project: {
      type: 'clients',
    },
    campaign: {
      type: 'campaigns',
    },
    inherits_from: {
      type: 'communication_templates',
    },
  },
}
