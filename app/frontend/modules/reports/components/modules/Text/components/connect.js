import { connect } from 'react-redux'
import { openModal } from '~/modules/admin/core/ui/modals'
import { getQuestions } from '~/modules/reports/core/builder/selectors'

export default connect(
  ({ report }, { modules, module }) => ({
    pageSize: report.builder.props.sizes,
    questions: getQuestions(report, (module || modules[0]).assessment_id),
  }),
  {
    openConditionalImage: data => openModal('conditionalImage', data),
  },
)
