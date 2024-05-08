
import * as t from 'io-ts'
import ApiAction from 'interfaces/ApiAction'

const FieldTR = t.type({
  field: t.string,
  value: t.string,
})
const SkillTR = t.type({
  id: t.number,
  name: t.string,
  category: t.string,
  desiredRating: t.number,
  minRating: t.number,
  maxRating: t.number,
  score: t.number,
})

const SkillGapTR = t.type({
  id: t.number,
  datasheetFields: t.array(FieldTR),
  profileFields: t.array(FieldTR),
  idpTemplateSkills: t.array(SkillTR),
})
export const FETCH_SKILL_GAPS = 'skill_gaps/FETCH'
export type FetchSkillGapsResponse = t.TypeOf<typeof SkillGapTR>
export const fetchSkillGaps = (userId: string):ApiAction<FetchSkillGapsResponse> => ({
  type: FETCH_SKILL_GAPS,
  request: {
    typedResponse: SkillGapTR,
    url: `/skill_gap_reports/${userId}`,
    loader: true,
  },
})
