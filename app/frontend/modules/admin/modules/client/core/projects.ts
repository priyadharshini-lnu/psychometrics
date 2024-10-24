import * as t from 'io-ts'
import _ from 'lodash'

import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import { createReducer } from '~/utils/redux'
import { ConfigState } from '~/core/config'
import { State as SamlSettingState } from './samlSetting'
import { State as SmtpSettingState } from './smtpSetting'
import { State as SecuritySettingstate } from './securitySetting'
import { RootState } from '~/modules/admin/core/rootReducers'

export const ProjectTR = t.type({
  id: t.string,
  name: t.string,
  number: t.string,
  subdomain: t.string,
  createdAt: t.string,
  updatedAt: t.string,
  disabled: t.boolean,
  clientId: t.string,
  url: t.string,
})

export type Project = t.TypeOf<typeof ProjectTR>

export interface State {
  config: ConfigState,
  project: {
    smtpSetting: SmtpSettingState,
    samlSetting: SamlSettingState,
    securitySetting: SecuritySettingstate,
    clientId: number,
  },
}

export const FETCH_SINGLE = 'resource/projects/FETCH'

const defaultState = {
  config: {},
  project: {},
  clientId: 0,
}

export const fetchSingle = (projectId: number) => ({
  type: FETCH_SINGLE,
  request: {
    method: 'get',
    url: `/administration/new_projects/${projectId}`,
    loader: true,
  },
})

type FetchType = ApiActionResponse<{
  project: Project,
}>

const HANDLERS = {
  [FETCH_SINGLE]: (_: State, { response }: ApiActionResponse<FetchType>) => response.project.clientId,
}

export const reducer = createReducer(HANDLERS, defaultState)

export const getClientId = (state: RootState) => _.get(state, ['project', 'clientId'])
