import { createReducer } from 'utils/reduxUtils'

export const OPEN = 'report/temp/colorPicker/OPEN'
export const CLOSE = 'report/temp/colorPicker/CLOSE'
export const CHANGE_COLOR = 'report/temp/colorPicker/CHANGE_COLOR'

export type Color = {
  r: number | string
  g: number | string
  b: number | string
  a: number | string
} & string

interface OpenParams {
  onChange: null | undefined | ((color: Color) => void)
  onComplete: null | undefined | ((color: Color) => void)
  color: Color | null | undefined
}

export const open = ({ onChange, onComplete, color }: OpenParams) => ({
  type: OPEN,
  payload: { onChange, onComplete, color },
})

export const changeColor = (color: Color) => ({ type: CHANGE_COLOR, payload: { color } })
export const close = () => ({ type: CLOSE })

interface State {
  isOpen: boolean
  color: Color | null | undefined
  onChange: null | undefined | ((color: Color) => void)
  onComplete: null | undefined | ((color: Color) => void)
}

export type Open = typeof open
export type ChangeColor = typeof changeColor
export type Close = typeof close


export type OpenResponse = ReturnType<typeof open>
export type ChangeColorResponse = ReturnType<typeof changeColor>
export type CloseResponse = ReturnType<typeof close>

const defaultState: State = {
  color: null,
  isOpen: false,
  onChange: null,
  onComplete: null,
}

const HANDLERS = {
  [OPEN]: (state: State, { payload: { onChange, onComplete, color } }: OpenResponse) => ({
    isOpen: true,
    onChange,
    onComplete,
    color,
  }),
  [CHANGE_COLOR]: (state: State, { payload: { color } }: ChangeColorResponse) => ({ ...state, color }),
  [CLOSE]: () => ({ isOpen: false, onChange: null, onComplete: null }),
}

export default createReducer(HANDLERS, defaultState)
