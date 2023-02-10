import * as t from 'io-ts'

import { createReducer } from '~/utils/redux'
import { ConfigState } from '~/core/config'
import { State as SamlSettingState } from './samlSetting'
import { State as SmtpSettingState } from './smtpSetting'
import { State as SecuritySettingstate } from './securitySetting'


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
  }
}

export const FETCH_SINGLE = 'resource/projects/FETCH'

const defaultState = {
  config: {},
  project: {},
}

export const fetchSingle = (projectId: number) => ({
  type: FETCH_SINGLE,
  request: {
    method: 'get',
    url: `/administration/new_projects/${projectId}`,
    loader: true,
  },
})

const HANDLERS = {
}

export const reducer = createReducer(HANDLERS, defaultState)
