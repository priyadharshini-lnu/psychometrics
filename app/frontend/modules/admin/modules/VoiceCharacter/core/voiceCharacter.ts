import * as t from 'io-ts'
import { ResourceIdentifierTR } from '~/modules/admin/core/types/resource'

export const VoiceCharacterTR = t.intersection([
  ResourceIdentifierTR,
  t.type({
    name: t.string,
    provider: t.string,
    externalVoiceId: t.string,
  }),
  t.partial({
    locale: t.union([t.string, t.null]),
    style: t.union([t.string, t.null]),
    rate: t.union([t.string, t.null]),
    pitch: t.union([t.string, t.null]),
    createdAt: t.union([t.string, t.null]),
    updatedAt: t.union([t.string, t.null]),
    tenant: t.union([
      t.intersection([t.type({ id: t.string }), t.partial({ name: t.string, type: t.string })]),
      t.null,
    ]),
  }),
])

export type VoiceCharacter = t.TypeOf<typeof VoiceCharacterTR>

export type AzureVoice = {
  externalVoiceId: string
  displayName: string
  locale: string
  localeName: string
  gender: string
  styles: string[]
}

export const Schema = {
  type: 'voice_characters',
  relationships: {
    tenant: {
      type: 'clients',
    },
  },
}
