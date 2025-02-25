import * as t from 'io-ts'
import { ResourceIdentifierTR } from '~/modules/admin/core/types/resource'

const SkillTR = t.type({
  id: t.string,
  name: t.union([t.string, t.null, t.undefined]),
  category: t.union([t.string, t.null, t.undefined]),
  projectId: t.union([t.string, t.null, t.undefined]),
})

export const ReportTR = t.type({
  id: t.string,
  name: t.string,
})

export const IdpTR = t.intersection([
  ResourceIdentifierTR,
  t.type({
    name: t.string,
    description: t.string,
    selfRatingEnabled: t.union([t.boolean, t.undefined]),
    behaviouralGlobalTags: t.union([t.array(t.string), t.undefined]),
    behaviouralClientTags: t.union([t.array(t.string), t.undefined]),
    technicalGlobalTags: t.union([t.array(t.string), t.undefined]),
    technicalClientTags: t.union([t.array(t.string), t.undefined]),
    behavioralGlobalSkillSettings: t.union([t.string, t.null]),
    behavioralClientSkillSettings: t.union([t.string, t.null]),
    technicalGlobalSkillSettings: t.union([t.string, t.null]),
    technicalClientSkillSettings: t.union([t.string, t.null]),
    skills: t.union([
      t.array(SkillTR),
      t.undefined]),
    report: t.union([
      ReportTR,
      t.undefined]),
  })])


export type Idp = t.TypeOf<typeof IdpTR>
export type Skill = t.TypeOf<typeof SkillTR>
export type Report = t.TypeOf<typeof ReportTR>

export const Schema = {
  type: 'idp_templates',
  relationships: {
    skills: {
      type: 'skills',
    },
    project: {
      type: 'clients',
    },
    report: {
      type: 'reports',
    },
  },
}
