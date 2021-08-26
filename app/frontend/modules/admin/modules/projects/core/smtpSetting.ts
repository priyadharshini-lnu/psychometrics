import ApiAction from 'interfaces/ApiAction'
import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import _ from 'lodash'
import { RootState } from 'modules/admin/core/rootReducers'
import { createReducer } from 'utils/redux'

export const get = (state: RootState) => _.get(state, ['project', 'smtpSetting'])

interface State {
  id: number
  host: string
  encryption: string
  port: number
  userName: string
  password: string
  authenticationType: string
  enabled: boolean
}

const defaultState = {} as State

export const UPDATE = 'resource/campaigns/smtpSetting/UPDATE'
export const TEST_SETTINGS = 'resource/campaigns/smtpSetting/TEST_SETTINGS'

export const sendTestEmail = (projectId: number, smtpSettingId: number, to_email: string): ApiAction<void> => ({
  type: TEST_SETTINGS,
  request: {
    method: 'post',
    url: `/administration/projects/${projectId}/smtp_settings/${smtpSettingId}/send_test_email`,
    body: { to_email },
    loader: true,
  },
})

const HANDLERS = {
  [UPDATE]: (_, { response }: ApiActionResponse<State>) => response,
}
export const reducer = createReducer(HANDLERS, defaultState)
