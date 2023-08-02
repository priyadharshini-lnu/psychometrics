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

export const defaultState = []

const HANDLERS = {
  [FETCH_WORKSHOP]: (_, { response }: ApiActionResponse<Workshop>) => response,
}

export default function reducer (state = defaultState, action) {
  const handler = HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
