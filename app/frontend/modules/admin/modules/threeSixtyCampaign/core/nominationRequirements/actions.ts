import { ApiActionResponse } from 'interfaces/ApiActionResponse'

export const FETCH = 'threeSixty/nominationRequirement/FETCH'
export const ADD = 'threeSixty/nominationRequirement/ADD'
export const REMOVE = 'threeSixty/nominationRequirement/REMOVE'
export const MOVE_UP = 'threeSixty/nominationRequirement/MOVE_UP'
export const MOVE_DOWN = 'threeSixty/nominationRequirement/MOVE_DOWN'
export const CHANGE_SELECTED_INDEX = 'threeSixty/nominationRequirement/CHANGE_SELECTED_INDEX'
export const RENAME_SELECTED_NOMINATION = 'threeSixty/nominationRequirement/RENAME'
export const COPY_SELECTED_NOMINATION = 'threeSixty/nominationRequirement/COPY'
export const SYNC_WITH_SERVER = 'threeSixty/nominationRequirement/SYNC_WITH_SERVER'

interface NominationRequirement {
  name: string
  position: number
  conditions: []
  subject_conditions: []
}

export const fetch = campaignId => ({
  type: FETCH,
  request: {
    url: `/administration/threesixty_campaigns/${campaignId}/nomination_requirements`,
  },
})

export const add = payload => ({ type: ADD, payload })

export const remove = (index: number) => ({ type: REMOVE, payload: { index } })

export const moveUp = (index: number) => ({ type: MOVE_UP, payload: { index } })

export const moveDown = (index: number) => ({ type: MOVE_DOWN, payload: { index } })

export const changeSelectedIndex = (index: number) => ({ type: CHANGE_SELECTED_INDEX, payload: { index } })

export const rename = (name: string) => ({ type: RENAME_SELECTED_NOMINATION, payload: { name } })

export const copy = () => ({ type: COPY_SELECTED_NOMINATION })

export const syncWithServer = (campaignId: number, nominationRequirements: NominationRequirement[]) => ({
  type: SYNC_WITH_SERVER,
  request: {
    url: `/administration/threesixty_campaigns/${campaignId}/nomination_requirements/save`,
    method: 'put',
    body: { nominationRequirements },
  },
})

interface FetchResponse {
  list: NominationRequirement[]
  selectedIndex: number
}

export type FetchType = ApiActionResponse<FetchResponse>
export type AddType = ReturnType<typeof add>
export type RemoveType = ReturnType<typeof remove>
export type MoveUpType = ReturnType<typeof moveUp>
export type MoveDownType = ReturnType<typeof moveDown>
export type ChangeSelectedIndexType = ReturnType<typeof changeSelectedIndex>
export type RenameType = ReturnType<typeof rename>
export type CopyType = ReturnType<typeof copy>
