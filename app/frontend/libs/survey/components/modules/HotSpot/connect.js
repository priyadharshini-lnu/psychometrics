import { connect } from 'react-redux'
import { select } from 'libs/survey/core/temp/hotSpot'

export default connect(
  ({ survey: { temp: { hotSpot: { shapeIndex } } } }) => ({ shapeIndex }),
  {
    select,
  },
)
