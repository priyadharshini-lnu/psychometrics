import { connect } from 'react-redux'
import { RootState } from '~/modules/reports/core/rootReducers'
import { closeModal, getData } from '~/modules/admin/core/ui/modals'
import { remapAssessment } from '~/modules/reports/core/builder/actions'

export default connect(
  (state: RootState) => ({
    reportId: state.report.builder.id,
    ...getData(state.report).remapAssessment,
    assessments: state.report.builder.assessments,
  }),
  {
    close: () => closeModal('remapAssessment'),
    remapAssessment,
  },
)
