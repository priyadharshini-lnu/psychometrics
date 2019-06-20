import { connect } from 'react-redux'
import {
  add,
  update,
  remove,
} from 'admin/core/threeSixtyCampaign/emailTemplates/reminderRules'

export default connect(
  null,
  (dispatch, { selectedEmailTemplateId }) => ({
    add: () => dispatch(add(selectedEmailTemplateId)),
    update: (index, fieldName, value) => dispatch(update(selectedEmailTemplateId, index, fieldName, value)),
    remove: index => dispatch(remove(selectedEmailTemplateId, index)),
  }),
)
