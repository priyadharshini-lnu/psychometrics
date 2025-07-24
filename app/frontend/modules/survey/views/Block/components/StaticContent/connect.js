import { connect } from 'react-redux'
import { updateBlockProps } from '~/modules/survey/core/builder/assessment/block/actions'

export default connect(
  ({ survey }) => ({
    currentLocale: survey.builder?.assessment?.locale,
    defaultLanguage: survey.builder?.assessment?.defaultLanguage,
  }),
  { updateBlockProps },
)
