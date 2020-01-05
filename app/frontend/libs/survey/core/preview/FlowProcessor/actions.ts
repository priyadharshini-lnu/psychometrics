export const INIT = 'flow_processor/INIT'
export const NEXT_PAGE = 'flow_processor/NEXT_PAGE'
export const PREV_PAGE = 'flow_processor/PREV_PAGE'
export const ANSWER = 'flow_processor/ANSWER'
export const SHOW_ERRORS = 'flow_processor/SHOW_ERRORS'
export const EMPTY_ERRORS = 'flow_processor/EMPTY_ERRORS'

export const nextPage = () => ({ type: NEXT_PAGE })

export const showErrors = (errors) => ({ type: SHOW_ERRORS, errors })

export const emptyErrors = () => ({ type: EMPTY_ERRORS })
