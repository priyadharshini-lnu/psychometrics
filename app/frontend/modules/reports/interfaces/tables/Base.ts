/**
 * @template P props
 */
export interface BasePreviewModel<P = {}, T = ''> extends BaseModel<P, T> {}

/**
 * @template P props
 */
export interface BasePropertiesModel<P = {}, T = ''> extends BaseModel<P, T> {
  update: () => void
}

/**
 * @template P Question props
 */
interface BaseModel<P = {}, T = ''> {
  id: number
  name: string | null
  position: number
  type: T
  removed: boolean
  assessment_id: number
  props: BaseProps<T> & P
}

interface BaseProps<T = ''> {
  type: T extends 'Table'
    ? TablePropTypes
    : T extends 'Graph'
    ? GraphPropTypes
    : ''
  position: {
    left: number
    top: number
    width: number
    height: number
  }
  style: {
    backgroundColor: string
    fontSize: string
    fontFamily: string
    width: string
  }
}

type TablePropTypes = 'GapAssessment' | 'Competencies'

type GraphPropTypes = 'Bubble'
