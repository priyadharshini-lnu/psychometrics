import { connect } from 'react-redux'
import { openModal } from '~/modules/admin/core/ui/modals'
import { selectQuestion, unselectQuestion } from '~/modules/survey/core/builder/assessment/actions'
import { moduleConfig } from '~/modules/survey/core/builder/assessment/question/selectors'
import { questionsWithoutDeleted } from '~/modules/survey/core/builder/assessment/selectors'
import {
  addSkipLogic, renameQuestion, saveAsTemplate, unlinkTemplate,
} from '~/modules/survey/core/builder/assessment/question/actions'
import {
  removeQuestion, moveQuestionUp, moveQuestionDown, moveQuestionToPosition,
  insertBeforeQuestion, insertAfterQuestion,
} from '~/modules/survey/core/builder/assessment/block/actions'

export default connect(
  ({
    survey: {
      builder, builder: {
        factors,
        assessment, assessment: {
          timestamp, propPanel,
          campaign_factors_list,
        },
      },
    },
  }, props) => ({
    selectedModel: propPanel.question,
    blocksOrder: assessment.blocks,
    moduleConfig: moduleConfig(builder, props.model.id),
    linkedAssessment: assessment.linkedAssessment,
    factors: factors.factors,
    timestamp, // NOTE: @fedor used to fake update
    campaignFactors: campaign_factors_list,
    currentLocale: assessment.locale,
    assessmentDefaultLanguage: assessment.defaultLanguage,
    questions: questionsWithoutDeleted(builder, props.block.questions),
  }),
  {
    select: selectQuestion,
    unselect: unselectQuestion,
    openDisplayLogic: data => openModal('displayLogic', data),
    openDefaultValue: data => openModal('defaultValue', data),
    openRandomization: data => openModal('randomization', data),
    openLinkedAssessment: data => openModal('linkedAssessment', data),
    openMoveQuestionModal: data => openModal('moveQuestion', data),
    removeQuestion,
    insertAfterQuestion,
    insertBeforeQuestion,
    moveQuestionUp,
    moveQuestionDown,
    moveQuestionToPosition,
    addSkipLogic,
    renameQuestion,
    saveAsTemplate,
    unlinkTemplate,
  },
)
