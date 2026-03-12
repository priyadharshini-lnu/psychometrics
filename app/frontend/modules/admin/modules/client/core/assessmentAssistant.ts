import * as t from 'io-ts'

export const AssessmentAssistantTR = t.type({
  id: t.string,
  assessmentId: t.string,
  aiAssistantId: t.union([t.string, t.null]),
  assessmentPrompt: t.union([t.string, t.null]),
})

export type AssessmentAssistant = t.TypeOf<typeof AssessmentAssistantTR>
