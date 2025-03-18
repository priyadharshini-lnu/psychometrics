import { BaseProps } from '../Base'

export interface BasePreviewModel<Props = {}, Type = ''>
  extends BaseModel<Props, Type> {
    update: () => void
  }

export interface BasePropertiesModel<Props = {}, Type = ''>
  extends BaseModel<Props, Type> {
  update: () => void
}

interface BaseModel<Props = {}, Type = ''> {
  id: number
  name: string | null
  position: number
  type: Type
  removed: boolean
  assessment_id: number
  props: BaseProps<Type> & Props
}
