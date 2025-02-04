import * as t from 'io-ts'
import { ResourceIdentifierTR } from '~/modules/admin/core/types/resource'
import ApiAction from '~/interfaces/ApiAction'

export enum DevelopmentActionCategory {
  course = 'course',
  default = 'default'
}

export enum DevelopmentActionLearningStyle {
  on_the_job = 'on_the_job',
  learning_from_others = 'learning_from_others',
  structured_learning = 'structured_learning'
}

export const DevelopmentActionTR = t.intersection([
  ResourceIdentifierTR,
  t.type({
    name: t.string,
    description: t.string,
    project: t.union([
      t.type({
        id: t.string,
        name: t.string,
      }),
      t.undefined]),
    category: t.union([
      t.keyof(DevelopmentActionCategory),
      t.undefined,
    ]),
    courseStartDate: t.union([
      t.string, t.null,
    ]),
    courseEndDate: t.union([
      t.string, t.null,
    ]),
    learningStyle: t.union([
      t.keyof(DevelopmentActionLearningStyle),
      t.undefined,
    ]),
    image: t.union([t.string, t.null]),
    courseUrl: t.union([t.string, t.null]),
  })])

export type DevelopmentAction = t.TypeOf<typeof DevelopmentActionTR>

export const Schema = {
  type: 'development_actions',
  relationships: {
    project: {
      type: 'projects',
    },
    skills: {
      type: 'skills',
      association: 'hasMany',
      singularName: 'skill',
    },
  },
}

const UPLOAD_FILES = 'resource/development_actions/UPLOAD_FILES'

export const uploadFiles = (id: string, data: FormData): ApiAction<void> => ({
  type: UPLOAD_FILES,
  request: {
    method: 'patch',
    url: `/api/v2/administration/development_actions/${id}/uploads`,
    body: data,
    contentType: 'multipart/form-data;' as const,
  },
})
