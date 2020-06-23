import { connect } from 'react-redux'
import { closeModal, getData } from 'modules/admin/core/temp/modals'
import { saveDisplayLogic } from 'modules/survey/core/builder/assessment/question/actions'
import LogicModel from 'modules/survey/models/logic/LogicElement'

export default connect(
  state => ({
    ...getData(state.survey).displayLogic,
    logic: new LogicModel(getData(state.survey).displayLogic.logicElement),
  }),
  {
    close: () => closeModal('displayLogic'),
    saveDisplayLogic,
  },
)
