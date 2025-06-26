import * as t from 'io-ts'
import ApiAction from 'interfaces/ApiAction'


export const IdpTemplateTR = t.type({
  id: t.string,
  name: t.string,
  description: t.string,
})

const DOWNLOAD_IDP_REPORT = 'idp/DOWNLOAD_IDP_REPORT'

export const downloadIdpReport = (campaignId: string, id: string, withRQ: boolean): ApiAction<null> => ({
  type: DOWNLOAD_IDP_REPORT,
  request: {
    method: 'get',
    url: `/administration/new_campaigns/${campaignId}/user_idp_reports/${id}/download`,
    body: {
      include_reflective_questions: withRQ,
    },
  },
})


export type IdpTemplate = t.TypeOf<typeof IdpTemplateTR>
