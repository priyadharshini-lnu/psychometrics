import { connect } from 'react-redux'
import { } from '~/modules/admin/core/ui/modals'

import Graph from './Graph'
import Shape from './Shape'
import Text from './Text'

const connecter = connect(
  ({ report: { builder } }) => ({
    reportStyles: builder.styles,
  }),
  null,
)


export default {
  Graph: connecter(Graph),
  Shape: connecter(Shape),
  Text: connecter(Text),
}
