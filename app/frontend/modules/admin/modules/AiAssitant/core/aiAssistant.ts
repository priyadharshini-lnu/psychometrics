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
    action: t.string,
  })])

export type AiAssistant = t.TypeOf<typeof AiAssistantTR>


export const Schema = {
  type: 'assistants',
}
