/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import _ from 'lodash'
import { denormalize } from 'normalizr'
import QuestionWrapper from '~/modules/survey/models/QuestionSerializer'
import BlockWrapper from '~/modules/survey/models/BlockSerializer'
import AssessmentInterface from '~/modules/survey/models/Assessment'
import { blocks } from '~/modules/survey/store/schema'

// Serialize Assessment
// assessment: {
//   - Assessment Attributes (props, flow, norm)
//   blocks: [
//     ...
//     {
//       - Block Attributes
//       questions: [
//         ...
//         {
//           - Question Attributes
//         }
//       ]
//     }
//   ]
// }

export const BlockSerializer = (data: any) => ({
  id: data.isNew ? undefined : data.id,
  name: data.name,
  position: data.position,
  props: data.props,
  template_id: data.templateId,
  save_as_template: data.saveAsTemplate,
  deleted_at: data.deletedAt,
  questions: data.questions,
})

export const QuestionSerializer = (data: any) => ({
  id: data.isNew ? undefined : data.id,
  block_id: data.blockId,
  name: data.name,
  position: data.position,
  type: data.type,
  props: data.props,
  validation: data.validation,
  required_validation: data.requiredValidation,
  display_logic: data.displayLogic,
  skip_logic: data.skipLogic,
  template_id: data.templateId,
  save_as_template: data.saveAsTemplate,
  deleted_at: data.deletedAt,
})

const AssessmentSerializer = (data: any): AssessmentInterface => ({
  id: data.id,
  name: data.name,
  flow: data.flow,
  norm_rules: data.norm_rules,
  default_norm_id: data.default_norm_id,
  enable_back: data.enable_back,
  enable_progress: data.enable_progress,
  extra: data.extra,
  data_sheet_columns: data.data_sheet_columns,
  options: data.options,
  instructions: data.instructions,
  linked_questions: data.linkedQuestions,
  default_language: data.defaultLanguage,
})


const SerializeAssessment = {
  run (builder: {assessment, flow}): AssessmentInterface {
    const { assessment, flow } = builder
    const data = AssessmentSerializer({ ...assessment, flow })

    const assessmentBlocks = _.reduce(denormalize(assessment.blocks, [blocks], builder), (blocks, blockModel) => {
      const block = BlockSerializer(BlockWrapper.wrap(blockModel))
      const questions = _.reduce(blockModel.questions, (questions, questionModel) => {
        const question = QuestionSerializer({
          ...QuestionWrapper.wrap(questionModel),
          block_id: block.id,
        })
        return [...questions, question]
      }, [])
      return [...blocks, { ...block, questions }]
    }, [])

    return { ...data, blocks: assessmentBlocks }
  },
}

export default SerializeAssessment
