import { connect } from 'react-redux'
import { openModal } from '~/modules/admin/core/ui/modals'

export default connect(
  ({ report: { builder } }) => ({
    reportStyles: builder.styles,
  }),
  {
    openConditionalText: data => openModal('conditionalText', data),
  },
)
