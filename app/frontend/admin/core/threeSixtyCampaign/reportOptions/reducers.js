import { getIn, setIn, updateIn } from 'utils/immutable'
import {
  FETCH_REPORT_OPTIONS,
  UPDATE_REPORT_OPTIONS,
  ADD_AVAILABILITY_CONDITION,
  ADD_NEW_LOGIC_SET_CONDITION,
  MOVE_CONDITION_TO_NEW_LOGIC_SET,
  REMOVE_AVAILABILITY_CONDITION,
  UPDATE_AVAILABILITY_CONDITION,
} from './actions'

const defaultCondition = { operator: 'and', type: 'evaluations', numberOfEvaluator: null, relationship: 'Manager' }

const HANDLERS = {
  [FETCH_REPORT_OPTIONS]: (_, { response }) => response,
  [UPDATE_REPORT_OPTIONS]: (state, { payload: { key, value } }) => setIn(state, key, value),
  [ADD_AVAILABILITY_CONDITION]: (state, { payload: { index } }) =>
    updateIn(state, ['availability', 'conditions', index, 'conditions'], conditions =>
      conditions.concat([defaultCondition]),
    ),
  [ADD_NEW_LOGIC_SET_CONDITION]: (state, { payload: { operator } }) =>
    updateIn(state, ['availability', 'conditions'], conditions =>
      conditions.concat({
        operator: operator,
        conditions: [{ ...defaultCondition, operator: 'if' }],
      }),
    ),
  [MOVE_CONDITION_TO_NEW_LOGIC_SET]: (state, { payload: { parent_index, child_index } }) =>
    updateIn(state, ['availability', 'conditions'], conditions =>
      conditions.concat({
        operator: 'and',
        conditions: [{ ...getIn(conditions, [parent_index, 'conditions', child_index]), operator: 'if' }],
      }),
    ),
  [REMOVE_AVAILABILITY_CONDITION]: (state, { payload: { parent_index, child_index } }) => {
    const path = ['availability', 'conditions', parent_index, 'conditions']
    const conditions = getIn(state, path)
    if (conditions.length > 1) {
      return updateIn(state, path, conditions => _.filter(conditions, (_, index) => index !== child_index))
    } else {
      return updateIn(state, ['availability', 'conditions'], conditions => {
        conditions = _.filter(conditions, (_, index) => index !== parent_index)
        conditions = conditions.map((condition, index) => (index === 0 ? { ...condition, operator: 'if' } : condition))
        return conditions
      })
    }
  },
  [UPDATE_AVAILABILITY_CONDITION]: (state, { payload: { parent_index, child_index, field, value } }) => {
    let path = ['availability', 'conditions', parent_index]
    path = _.isNull(child_index) ? path : path.concat(['conditions', child_index])
    return updateIn(state, path, condition => ({
      ...condition,
      [field]: value,
    }))
  },
}

const defaultState = { access: {}, approval: {}, availability: { conditions: [] } }

export default function reducer(state = defaultState, action) {
  const handler = HANDLERS[action.type]
  return handler ? handler(state, action) : state
}

// Threesixty::Option.first.update(reports: {"access"=>{"self_can_access"=>true, "manager_can_access"=>true, "manager_cannot_see_report_until_requirements_are_met"=>true},
//    "approval"=>{},
//    "availability"=>{"report_available_to_subject_on_criteria"=>true, conditions: [
//     {
//       operator: "if",
//       conditions: [
//         {
//           operator: "if",
//           type: "Evaluation",
//           numberOfEvaluator: 3,
//           relationship: "Manager"
//         },
//         {
//           operator: "or",
//           type: "Evaluation",
//           numberOfEvaluator: 1,
//           relationship: "Manager"
//         },
//         {
//           operator: "and",
//           type: "Evaluation",
//           numberOfEvaluator: 1,
//           relationship: "Manager"
//         }
//       ]
//     },
//     {
//       operator: "and",
//       conditions: [
//         {
//           operator: "if",
//           type: "Evaluation",
//           numberOfEvaluator: 10,
//           relationship: "Manager"
//         },
//         {
//           operator: "and",
//           type: "Evaluation",
//           numberOfEvaluator: 10,
//           relationship: "Direct Report"
//         }
//       ]
//     }
//   ]}})
