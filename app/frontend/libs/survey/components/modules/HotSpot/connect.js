import { connect } from 'react-redux'
import { select } from 'libs/survey/core/temp/hotSpot'
import { getI18n } from 'libs/survey/core/preview/FlowProcessor/selectors'

export default connect(
  ({ preview, survey: { temp: { hotSpot: { shapeIndex } } } }) => ({
    shapeIndex,
    I18n: getI18n(preview),
  }),
  {
    select,
  },
)
