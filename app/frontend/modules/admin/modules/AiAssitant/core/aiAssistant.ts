import * as t from 'io-ts'
import { ResourceIdentifierTR } from '~/modules/admin/core/types/resource'

export const ModelParamsTR = t.partial({
  maxTokens: t.union([t.number, t.null]),
  temperature: t.union([t.number, t.null]),
  thinkingEffort: t.union([t.string, t.null]),
  thinkingBudget: t.union([t.number, t.null]),
})

export const AiAssistantTR = t.intersection([
  ResourceIdentifierTR,
  t.type({
    name: t.string,
    description: t.string,
    modelId: t.string,
    systemPrompt: t.string,
    userPrompt: t.union([t.string, t.null]),
    assistantType: t.string,
    advancedPromptingEnabled: t.boolean,
    inUse: t.boolean,
    providerPreviouslyUsed: t.boolean,
    assistantOutputSchemaKeysAttributes: t.array(t.type({
      id: t.number,
      key: t.string,
      description: t.string,
      keyType: t.string,
    })),
    dependencies: t.union([t.array(t.string), t.null]),
    modelParams: t.union([ModelParamsTR, t.null]),
  }),
])


export const ChangeValueTR = t.union([
  t.string,
  t.number,
  t.array(t.union([t.string, t.number, t.null])),
])


export const AIAssistantRevisionTR = t.type({
  id: t.string,
  auditId: t.number,
  createdAt: t.string,
  action: t.string,
  version: t.number,
  userId: t.union([t.number, t.null]),
  changes: t.partial({
    name: ChangeValueTR,
    userPrompt: ChangeValueTR,
    systemPrompt: ChangeValueTR,
    modelId: ChangeValueTR,
    assistantType: ChangeValueTR,
    modelParams: t.array(t.union([ModelParamsTR, t.null])),
  }),
})


export const AIAssistantRevisionsTR = t.array(AIAssistantRevisionTR)
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
