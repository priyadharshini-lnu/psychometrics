import { TYPES } from 'constants/emailCriteria'
import Datasheet from './Datasheet'
import Invitation from './Invitation'
import Relationship from './Relationship'
import Evaluation from './Evaluation'
import EvaluatorType from './EvaluatorType'
import ManagerTask from './ManagerTask'
import NominationRequirement from './NominationRequirement'
import Number from './Number'
import SelfEvaluation from './SelfEvaluation'
import String from './String'
import Task from './Task'

export default {
  [TYPES.NAME_OR_EMAIL]: String,
  [TYPES.FIRST_NAME]: String,
  [TYPES.LAST_NAME]: String,
  [TYPES.DATASHEET]: Datasheet,
  [TYPES.SUBJECT_DATASHEET]: Datasheet,
  [TYPES.RELATIONSHIP]: Relationship,
  [TYPES.NOMINATION_REQUIREMENTS]: NominationRequirement,
  [TYPES.SELF_EVALUATIONS]: SelfEvaluation,
  [TYPES.EVALUATIONS]: Evaluation,
  [TYPES.EVALUATIONS_RECEIVED]: Number,
  [TYPES.TASKS]: Task,
  [TYPES.MANAGER_TASKS]: ManagerTask,
  [TYPES.EVALUATOR_TYPE]: EvaluatorType,
  [TYPES.INVITATION]: Invitation,
}
