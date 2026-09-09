import { ENABLE, DISABLE } from '~/modules/survey/core/builder/assessment/actions'

export const enableApp = () => ({ type: ENABLE })
export const disableApp = ({ reason = 'unknown', message = null } = {}) => ({
  type: DISABLE,
  payload: { reason, message },
})
