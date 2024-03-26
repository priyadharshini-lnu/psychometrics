import { DevelopmentActionBoardView } from '~/components/IdpShared/DevelopmentActions'
import { IdpData } from '../List'

export const Board = () => (
  <>
    <DevelopmentActionBoardView categories={IdpData} />
  </>
)
