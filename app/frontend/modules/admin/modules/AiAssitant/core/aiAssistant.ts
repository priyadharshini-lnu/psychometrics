import * as t from 'io-ts'
import { ResourceIdentifierTR } from '~/modules/admin/core/types/resource'

export const AiAssistantTR = t.intersection([
  ResourceIdentifierTR,
  t.type({
    name: t.string,
    description: t.string,
    modelId: t.string,
    systemPrompt: t.string,
    userPrompt: t.string,
    assistantType: t.string,
    assistantOutputSchemaKeysAttributes: t.array(t.type({
      id: t.number,
      key: t.string,
      description: t.string,
      keyType: t.string,
    })),
    dependencies: t.union([t.array(t.string), t.null]),
  }),
])

export const AIAssistantRevisionTR = t.type({
  id: t.string,
  auditId: t.number,
  createdAt: t.string,
  action: t.string,
  version: t.number,
  userId: t.union([t.number, t.null]),
  changes: t.type({
    name: t.array(t.union([t.string, t.null])),
    userPrompt: t.array(t.union([t.string, t.null])),
    systemPrompt: t.array(t.union([t.string, t.null])),
  }),
})

export type AiAssistant = t.TypeOf<typeof AiAssistantTR>
export type AIAssistantRevision = t.TypeOf<typeof AIAssistantRevisionTR>

export const Schema = {
  type: 'assistants',
  relationships: {
    assistantOutputSchemaKeys: {
      type: 'assistant_output_schema_keys',
    },
  },
}
