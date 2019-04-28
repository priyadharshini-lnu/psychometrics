import _ from "lodash";
import { takeLatest, put, select, delay } from 'redux-saga/effects'

const FETCH_PARTICIPATION_OPTIONS = 'threeSixty/option/participations/FETCH_PARTICIPATION_OPTIONS'
const UPDATE_PARTICIPATION_OPTIONS = 'threeSixty/option/participations/UPDATE_PARTICIPATION_OPTIONS'
const SYNC_PARTICIPATION_OPTIONS = 'threeSixty/option/participations/SYNC_PARTICIPATION_OPTIONS'
const ADD_DATASHEET_CRITERIA = 'threeSixty/option/participations/ADD_DATASHEET_CRITERIA'
const REMOVE_DATASHEET_CRITERIA = 'threeSixty/option/participations/REMOVE_DATASHEET_CRITERIA'
const UPDATE_DATASHEET_CRITERIA = 'threeSixty/option/participations/UPDATE_DATASHEET_CRITERIA'

export const getParticipantOption = state => state.threeSixtyCampaign.option.participants

export const fetchParticipationOptions = campaignId => ({
  type: FETCH_PARTICIPATION_OPTIONS,
  request: {
    url: `/administration/threesixty_campaigns/${campaignId}/options/participation_options`,
    body: {
      q: {
        relationship_name_eq: 'Manager',
      },
    },
  },
})

const syncParticipationOptionsWithServer = (campaignId, body) => ({
  type: SYNC_PARTICIPATION_OPTIONS,
  request: {
    method: 'put',
    url: `/administration/threesixty_campaigns/${campaignId}/options/`,
    body: body
  }
})

export const updateParticipationOptions = (campaignId, key, value) => ({
  type: UPDATE_PARTICIPATION_OPTIONS,
  payload: { campaignId, key, value }
})

export const addDatasheetCriteria = (campaignId, key) => ({
  type: ADD_DATASHEET_CRITERIA,
  payload: { campaignId, key }
})

export const removeDatasheetCriteria = (campaignId, key, index) => ({
  type: REMOVE_DATASHEET_CRITERIA,
  payload: { campaignId, key, index }
})

export const updateDatasheetCriteria = (campaignId, key, index, name, value) => ({
  type: UPDATE_DATASHEET_CRITERIA,
  payload: { campaignId, key, index, name, value }
})

function* genSyncParticipationOptionsWithServer({payload: { campaignId }}) {
  yield delay(1000)
  let body = yield select(getParticipantOption)
  yield put(syncParticipationOptionsWithServer(campaignId, body))
}

export const watchers = [
  takeLatest(
    [UPDATE_PARTICIPATION_OPTIONS, ADD_DATASHEET_CRITERIA, REMOVE_DATASHEET_CRITERIA, UPDATE_DATASHEET_CRITERIA],
    genSyncParticipationOptionsWithServer
  )
]

const DEFAULT = {
  evaluator_can_decline_nomination: true,
  email_subject_when_evaluators_declines_nomination: true,
  manager_can_view_nominations: true,
  manager_can_choose_evaluators: true,

  managers_approve_nominations: true,
  email_managers_on_nomination_approval: true,
  subjects_can_email_managers: true,
  email_subjects_when_manager_nominates_them: true,
  email_subject_when_manager_declines_nomination: true,

  manager_approves_evaluations: true,

  subject_can_evaluate_self: true,
  limit_self_evaluation_by_criteria: true,
  self_evaluation_criteria:  [
    { field: "gender", operator: "equal", value: "12" },
    { field: "grade", operator: "is_same_as_subject" }
  ],

  subject_can_opt_in_assessment: true,
  restrict_subject_email_to_domail: true,
  restricted_domain_name: "gmail.com, mm.com",

  subject_can_nominate_evaluators: true,
  subject_can_nominate_anyone_not_in_assessment: true,
  subject_can_nominate_anyone_in_assessment: true,
  limit_nomination_by_subject_to_anyone_in_assessment: true,
  limit_nomination_by_subject_to_anyone_criteria: [],

  subject_can_nominate_anyone_from_datasheet: true,
  limit_nomination_by_subject_from_datasheet: true,
  limit_nomination_by_subject_from_datasheet_criteria: [],

  subject_cannot_remove_nomination_set_by_manager_and_admin: true,

  subject_can_select_relationship: true,
  limit_relationship_that_subject_can_select: true,
  subject_can_select_customer_relationship: true,
  subject_can_select_direct_report_relationship: true,
  subject_can_select_manager_relationship: true,
  subject_can_select_peer_relationship: true,
  subject_can_select_supplier_relationship: true,

  subject_can_view_completion_status_of_evaluation: true,
  subject_can_view_individual_evaluations: true
}

export const defaultState = []
export default function reducer (state = defaultState, {type, payload}) {
  switch (type) {
    case FETCH_PARTICIPATION_OPTIONS:
      return DEFAULT
    case UPDATE_PARTICIPATION_OPTIONS:
      return { ...state, [payload.key]: payload.value };
    case ADD_DATASHEET_CRITERIA:
      var criterias = (state[payload.key] || []).concat([{operator: "is_same_as_subject"}])
      return { ...state, [payload.key]: criterias }
    case REMOVE_DATASHEET_CRITERIA:
      var criterias = [...state[payload.key]]
      criterias.splice(payload.index, 1)
      return { ...state, [payload.key]: criterias }
    case UPDATE_DATASHEET_CRITERIA:
      var criterias = state[payload.key].map((criteria, index) => {
        if (index != payload.index) { return criteria }
        return { ...criteria, [payload.name]: payload.value }
      })
      return { ...state, [payload.key]: criterias }
    default:
      return state
  }
}
