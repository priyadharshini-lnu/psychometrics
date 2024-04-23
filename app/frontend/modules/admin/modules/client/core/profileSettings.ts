import * as t from 'io-ts'
import { ResourceIdentifierTR } from './resource'

export const ProfileQuestionTR = t.type({
  id: t.number,
  name: t.string,
})

export const ProfileFieldTR = t.type({
  id: t.union([t.string, t.undefined, t.null]),
  questionId: t.number,
  name: t.string,
  required: t.boolean,
  halfSize: t.boolean,
  position: t.number,
  locked: t.boolean,
})

export const ProfileSettingsTR = t.intersection([
  ResourceIdentifierTR,
  t.type({
    id: t.string,
    updateIn: t.union([t.string, t.null]),
    fieldQuestions: t.array(ProfileQuestionTR),
    profileFields: t.array(ProfileFieldTR),
    project: t.union([
      t.type({
        id: t.string,
      }),
      t.undefined]),
    requiredDefaultFields: t.type({}),
    lockedDefaultFields: t.type({}),
    enabledDefaultFields: t.type({}),
  }),
])

export type QuestionField = t.TypeOf<typeof ProfileQuestionTR>
export type ProfileField = t.TypeOf<typeof ProfileFieldTR> & { _remove?: boolean }
export type ProfileSettings = t.TypeOf<typeof ProfileSettingsTR>

export const Schema = {
  type: 'design_settings',
  relationships: {
    project: {
      type: 'projects',
    },
  },
}
