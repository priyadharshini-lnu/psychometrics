import { connect } from 'react-redux'
import { openModal } from '~/modules/admin/core/ui/modals'
import {
  toggleEnableBack, toggleEnableProgress, toggleSingleQuestionPage, saveAssessment, updateExtra,
  toggleInstructions, exportQuestions,
} from '~/modules/survey/core/builder/assessment/actions'
import { createBlock } from '~/modules/survey/core/builder/assessment/block/actions'
import { trashItems, blocksWithQuestions } from '~/modules/survey/core/builder/assessment/selectors'

export default connect(
  state => ({
    assessment: state.survey.builder.assessment,
    builder: state.survey.builder,
    saving: state.survey.builder.saving,
    blocks: state.survey.builder.assessment.blocks,
    flow: state.survey.builder.flow,
    blocksWithQuestions: blocksWithQuestions(state.survey.builder, state.survey.builder.assessment.blocks),
    trash: trashItems(state),
    instructions: state.survey.builder.assessment.instructions,
  }),
  {
    openDataSheetModal: data => openModal('dataSheetModal', data),
    openImportQuestionsModal: data => openModal('importQuestionsModal', data),
    openFlow: data => openModal('flow', data),
    openMapNorms: data => openModal('mapNorms', data),
    openCreateByTemplate: data => openModal('createByTemplate', data),
    openSettings: data => openModal('settings', data),
    createBlock,
    toggleEnableBack,
    toggleEnableProgress,
    toggleSingleQuestionPage,
    saveAssessment,
    updateExtra,
    toggleInstructions,
    openCampaignFactorsModal: data => openModal('campaignFactorsModal', data),
    exportQuestions,
  },
)
