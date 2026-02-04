
import * as t from 'io-ts'
import ApiAction from 'interfaces/ApiAction'


const DefaultLanguageTR = t.type({
  code: t.string,
  direction: t.string,
  name: t.string,
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const SkillGapTR = t.type({
  id: t.number,
  campaign_id: t.number,
  is_self: t.boolean,
  pdf: t.union([t.string, t.null]),
  report: t.type({
    default_language: DefaultLanguageTR,
    available_languages: t.array(DefaultLanguageTR),
    locales: t.type({}),
  }),
  report_data: t.array(t.type({})),
  report_url: t.string,
  results: t.type({}),
  status: t.string,
  user: t.type({
    datasheet: t.any,
    email: t.string,
    first_name: t.string,
    id: t.number,
    last_name: t.string,
    photo: t.union([t.string, t.null]),
  }),
})

export const FETCH_SKILL_GAPS = 'skill_gaps/FETCH'
export type FetchSkillGapsResponse = t.TypeOf<typeof SkillGapTR>
export const fetchSkillGaps = (userId: string, params = {}):ApiAction<FetchSkillGapsResponse> => ({
  type: FETCH_SKILL_GAPS,
  request: {
    method: 'get',
    body: params,
    url: `/skill_gap_reports/${userId}`,
    camelize: false,
  },
})
