import { connect } from 'react-redux'
import { openModal } from '~/modules/admin/core/ui/modals'

export default connect(
  state => ({
    reportStyles: state.report.builder.styles,
  }),
  {
    openConditionalText: data => openModal('conditionalText', data),
  },
)
