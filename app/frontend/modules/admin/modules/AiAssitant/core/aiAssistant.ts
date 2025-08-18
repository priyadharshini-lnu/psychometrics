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

export type AiAssistant = t.TypeOf<typeof AiAssistantTR>

export const Schema = {
  type: 'assistants',
  relationships: {
    assistantOutputSchemaKeys: {
      type: 'assistant_output_schema_keys',
    },
  },
}
