import ApiAction from 'interfaces/ApiAction'
import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import _ from 'lodash'
import { RootState } from '~/modules/admin/core/rootReducers'
import { FETCH_SINGLE as FETCH_PROJECT } from '~/modules/admin/modules/client/core/projects'
import { createReducer } from '~/utils/redux'
import { State as ProjectState } from './projects'

export const get = (state: RootState) => _.get(state, ['project', 'smtpSetting'])

export interface State {
  id: number
  host: string
  encryption: string
  port: number
  userName: string
  password: string
  authenticationType: string
  enabled: boolean
  fromName: string
  fromEmail: string
  useSenderAuthentication: boolean
  testEmailId?: string
}

const defaultState = {} as State

export const VALIDATE_SETTINGS = 'resource/campaigns/smtpSetting/VALIDATE_SETTINGS'
export const SAVE_SETTINGS = 'resource/campaigns/smtpSetting/SAVE_SETTINGS'
export const TEST_SETTINGS = 'resource/campaigns/smtpSetting/TEST_SETTINGS'

export const validateSettings = (projectId: number, resource: Partial<State>): ApiAction<void> => ({
  type: VALIDATE_SETTINGS,
  request: {
    method: 'post',
    url: `/administration/projects/${projectId}/smtp_settings/validate_settings`,
    body: { resource },
    loader: true,
  },
})

export const saveSettings = (projectId: number, smtpSettingId: number, resource: Partial<State>): ApiAction<void> => ({
  type: SAVE_SETTINGS,
  request: {
    method: 'put',
    url: `/administration/projects/${projectId}/smtp_settings/${smtpSettingId}`,
    body: { resource },
    loader: true,
  },
})

export const sendTestEmail = (projectId: number, smtpSetting: Partial<State>, to_email: string): ApiAction<void> => ({
  type: TEST_SETTINGS,
  request: {
    method: 'post',
    url: `/administration/projects/${projectId}/smtp_settings/send_test_email`,
    body: { resource: smtpSetting, to_email },
    loader: true,
  },
})

type FetchProjectType = ApiActionResponse<ProjectState>

const HANDLERS = {
  [SAVE_SETTINGS]: (_, { response }: ApiActionResponse<State>) => response,
  [FETCH_PROJECT]: (state: State, { response: { project: { smtpSetting } } }: FetchProjectType) => ({
    ...state,
    ...smtpSetting,
  }),
}
export const reducer = createReducer(HANDLERS, defaultState)
