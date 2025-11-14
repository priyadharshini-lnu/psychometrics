import * as t from 'io-ts'
import { AiAssistantTR } from '~/modules/admin/modules/AiAssitant/core/aiAssistant'
import { ResourceIdentifierTR } from '~/modules/admin/core/types/resource'

export const AiArtifactTR = t.intersection([
  ResourceIdentifierTR,
  t.type({
    name: t.string,
    instructions: t.string,
    code: t.string,
    dependenciesAttributes: t.type({
      sheetColumns: t.array(t.type({
        id: t.string,
      })),
      campaignFactors: t.array(t.type({
        id: t.string,
      })),
      questions: t.array(t.type({
        id: t.string,
        assessmentId: t.string,
        name: t.string,
        assessmentName: t.string,
      })),
    }),
    aiAssistant: AiAssistantTR,
    includeAllDatasheetColumns: t.boolean,
    assessments: t.boolean,
    campaign: t.type({
      id: t.string,
      type: t.literal('campaigns'),
    }),
  }),
])

export const ArtifactResultsAttributesTR = t.type({
  error: t.union([t.string, t.null]),
  artifact: t.type({
    id: t.number,
    name: t.string,
    code: t.string,
  }),
  results: t.array(t.type({
    key: t.string,
    value: t.union([t.string, t.null]),
    type: t.string,
  })),
  parsedDependencies: t.union([t.string, t.null]),
  generatedAt: t.union([t.string, t.null]),
  totalInputTokens: t.union([t.number, t.undefined]),
  totalOutputTokens: t.union([t.number, t.undefined]),
})

export const CampaignAiArtifactResultTR = t.type({
  id: t.string,
  generatedAt: t.union([t.string, t.null]),
  artifactsResults: t.type({
    data: t.array((t.type({
      id: t.string,
      attributes: ArtifactResultsAttributesTR,
    }))),
  }),
  user: t.type({
    data: t.type({
      id: t.string,
      attributes: t.type({
        name: t.string,
        email: t.string,
        firstName: t.string,
        lastName: t.string,
        fullName: t.string,
        updatedAt: t.string,
        disabled: t.boolean,
        enable2fa: t.boolean,
        createdBy: t.string,
        modifiedBy: t.string,
        role: t.string,
        projectId: t.number,
        photoUrl: t.union([t.string, t.null]),
        accessLocked: t.boolean,
      }),
    }),
  }),
})

export const Schema = {
  type: 'ai_artifacts',
  relationships: {
    ai_assistant: {
      type: 'ai_assistants',
    },
    campaign: {
      type: 'campaigns',
    },
  },
}

export type AiArtifact = t.TypeOf<typeof AiArtifactTR>
export type CampaignAiArtifactResult = t.TypeOf<typeof CampaignAiArtifactResultTR>
export type ArtifactResultsAttributes = t.TypeOf<typeof ArtifactResultsAttributesTR>


export type CampaignAiArtifactDataSource = {
  id: string
  key: string
  participantId: string
  name: string
  email: string
  artifacts: {
    [key: string]: {
      results: Array<{
        key: string
        value: string | null
        type: string
      }>
      error: string | null
      id: number
      parsedDependencies: string | null
      generatedAt: string | null,
      totalInputTokens: number | undefined,
      totalOutputTokens: number | undefined,
    }
  }
  generatedAt: string | null
}
