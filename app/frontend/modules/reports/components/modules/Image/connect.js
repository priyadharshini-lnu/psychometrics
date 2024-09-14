import { connect } from 'react-redux'
import { openModal } from '~/modules/admin/core/ui/modals'

export default connect(
  ({ report: { builder } }) => ({
    pageSize: builder.props.sizes,
    questions: builder.questions,
    reportStyles: builder.styles,
  }),
  {
    openConditionalImage: data => openModal('conditionalImage', data),
  },
)
