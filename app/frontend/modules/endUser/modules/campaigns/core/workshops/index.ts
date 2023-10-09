import { Workshop } from '~/modules/admin/modules/campaigns/core/workshop'
import ApiAction from '~/interfaces/ApiAction'
import { ApiActionResponse } from '~/interfaces/ApiActionResponse'

export const FETCH_WORKSHOP = 'workshopList/FETCH'
export const fetchWorkshop = (): ApiAction<Workshop> => ({
  type: FETCH_WORKSHOP,
  request: {
    url: '/workshop',
    loader: true,
  },
})

const FETCH_END_USER = 'workshop/FETCH'
export const fetchEndUserWorkshop = (id: string) => ({
  type: FETCH_END_USER,
  request: { url: `/assessment_centers/${id}` },
})

export const defaultState = null

const HANDLERS = {
  [FETCH_WORKSHOP]: (_, { response }: ApiActionResponse<Workshop>) => response,
  [FETCH_END_USER]: (state, action) => ({ ...state, ...action.response, loaded: true }),
}

export default function reducer (state = defaultState, action) {
  const handler = HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
