import { TYPES } from 'constants/emailCriteria'
import Datasheet from './Datasheet'
import Invitation from './Invitation'
import Relationship from './Relationship'
import Evaluation from './Evaluation'
import EvaluatorType from './EvaluatorType'
import ManagerTask from './ManagerTask'
import NominationRequirement from './NominationRequirement'
import NumberComparator from './Number'
import SelfEvaluation from './SelfEvaluation'
import StringComparator from './String'
import Task from './Task'

export default {
  [TYPES.NAME_OR_EMAIL]: StringComparator,
  [TYPES.FIRST_NAME]: StringComparator,
  [TYPES.LAST_NAME]: StringComparator,
  [TYPES.DATASHEET]: Datasheet,
  [TYPES.SUBJECT_DATASHEET]: Datasheet,
  [TYPES.RELATIONSHIP]: Relationship,
  [TYPES.NOMINATION_REQUIREMENTS]: NominationRequirement,
  [TYPES.SELF_EVALUATIONS]: SelfEvaluation,
  [TYPES.EVALUATIONS]: Evaluation,
  [TYPES.EVALUATIONS_RECEIVED]: NumberComparator,
  [TYPES.TASKS]: Task,
  [TYPES.MANAGER_TASKS]: ManagerTask,
  [TYPES.EVALUATOR_TYPE]: EvaluatorType,
  [TYPES.INVITATION]: Invitation,
}
