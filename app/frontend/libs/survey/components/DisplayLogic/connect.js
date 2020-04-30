import { connect } from 'react-redux'
import { closeModal, getData } from 'admin/core/temp/modals'
import { saveDisplayLogic } from 'libs/survey/core/builder/assessment/question/actions'
import LogicModel from 'libs/survey/models/logic/LogicElement'

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
