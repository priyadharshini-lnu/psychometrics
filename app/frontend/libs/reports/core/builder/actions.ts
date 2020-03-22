export const INIT = 'report/INIT'
export const ENABLE = 'report/ENABLE'
export const DISABLE = 'report/DISABLE'
export const OPEN_RICH_EDITOR = 'report/OPEN_RICH_EDITOR'
export const CLOSE_RICH_EDITOR = 'report/CLOSE_RICH_EDITOR'

interface OpenRichEditor { type: typeof OPEN_RICH_EDITOR }
interface CloseRichEditor { type: typeof CLOSE_RICH_EDITOR }

export const openRichEditor = (): OpenRichEditor => ({ type: OPEN_RICH_EDITOR })
export const closeRichEditor = (): CloseRichEditor => ({ type: CLOSE_RICH_EDITOR })
