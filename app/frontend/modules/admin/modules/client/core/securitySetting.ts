import _ from 'lodash'
import ApiAction from 'interfaces/ApiAction'
import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import { RootState } from '~/modules/admin/core/rootReducers'

import { createReducer } from '~/utils/redux'

export const get = (state: RootState) => _.get(state, ['project', 'securitySetting'])

export interface State {
  id: number
}

const defaultState = {} as State

export const SAVE_SETTINGS = 'resource/campaigns/securitySetting/SAVE_SETTINGS'


export const saveSettings = (projectId: number, smtpSettingId: number, resource: State): ApiAction<void> => ({
  type: SAVE_SETTINGS,
  request: {
    method: 'put',
    url: `/administration/projects/${projectId}/smtp_settings/${smtpSettingId}`,
    body: { resource },
    loader: true,
  },
})

const HANDLERS = {
  [SAVE_SETTINGS]: (_, { response }: ApiActionResponse<State>) => response,
}
export const reducer = createReducer(HANDLERS, defaultState)
