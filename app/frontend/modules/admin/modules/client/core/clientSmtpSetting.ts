import ApiAction from 'interfaces/ApiAction'
import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import _ from 'lodash'
import { RootState } from '~/modules/admin/core/rootReducers'
import { createReducer } from '~/utils/redux'

export const get = (state: RootState) => _.get(state, ['clientSmtpSetting'])

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
    useSenderVerification: boolean
    testEmailId?: string
}

const defaultState = {} as State

export const VALIDATE_SETTINGS = 'resource/clients/smtpSetting/VALIDATE_SETTINGS'
export const SAVE_SETTINGS = 'resource/clients/smtpSetting/SAVE_SETTINGS'
export const TEST_SETTINGS = 'resource/clients/smtpSetting/TEST_SETTINGS'
export const FETCH_SETTINGS = 'resource/clients/smtpSetting/FETCH_SETTINGS'

export const validateSettings = (clientId: number, resource: Partial<State>): ApiAction<void> => ({
  type: VALIDATE_SETTINGS,
  request: {
    method: 'post',
    url: `/administration/clients/${clientId}/smtp_settings/validate_settings`,
    body: { resource },
    loader: true,
  },
})

export const saveSettings = (clientId: number, _smtpSettingId: number, resource: Partial<State>): ApiAction<void> => ({
  type: SAVE_SETTINGS,
  request: {
    method: 'put',
    url: `/administration/clients/${clientId}/smtp_settings`,
    body: { resource },
    loader: true,
  },
})

export const sendTestEmail = (clientId: number, smtpSetting: Partial<State>, to_email: string): ApiAction<void> => ({
  type: TEST_SETTINGS,
  request: {
    method: 'post',
    url: `/administration/clients/${clientId}/smtp_settings/send_test_email`,
    body: { resource: smtpSetting, to_email },
    loader: true,
  },
})

export const fetchSettings = (clientId: number): ApiAction<State> => ({
  type: FETCH_SETTINGS,
  request: {
    method: 'get',
    url: `/administration/clients/${clientId}/smtp_settings`,
    loader: true,
  },
})

const HANDLERS = {
  [SAVE_SETTINGS]: (_, { response }: ApiActionResponse<State>) => response,
  [FETCH_SETTINGS]: (_, { response }: ApiActionResponse<State>) => response,
}
export const reducer = createReducer(HANDLERS, defaultState)
