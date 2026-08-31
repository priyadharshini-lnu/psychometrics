/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import {
  setLocalResults, nextPage, addPrevPage,
  removePrevPage, showErrors, emptyErrors, showPage, addQuestionError,
  removeQuestionError, showEnd, hideEnd, changeElement, hideQuestion,
  showQuestion, showSubmitPage, hideSubmitPage, setEmbeddedData,
  setDirtyResults, setNotDirtyResults, toggleHiddenQuestions,
  toggleIgnoreValidation, reset, markQuestionInProgress, removeQuestionInProgress,
  clearInProgressQuestion, markAssessmentTimedOut, updateHighlight,
  addMediaResponse, removeMediaResponse, markMediaResponseAsSelected, setIsSimulation,
  showErrorWarning, setSubmissionInProgress, setAnswersSaved,
} from './actions'
import type { CampaignFactor } from '~/components/CampaignFactorsForm'

export interface Question {
  id: number
  deleted?: boolean
  type?: string
  display_logic?: object
  skip_logic?: object[]
  required_validation?: { enabled: boolean, type: string }
  props?: any
  hidden?: boolean
  isNeedToAddLtrManually?: boolean
}

export interface AssessmentOptions {
  enable_single_question_page?: boolean
}

export interface Block {
  id: number;
  deleted?: boolean
  questions: Question[]
  props?: { randomization?, staticContent? }
}

export interface Factor {
  id: number
  name: string
  question_ids: number[]
}

export interface BlocksInterface {
  blocks: Block[]
  factors: Factor[]
}
export interface PageInterface {
  questions: number[]
  blockId: number
  skipLogic?: {}
}
export interface BlockElementInterface {
  type: string
  props: {
    current: string
  }
  elements: any[]
}

export interface EndOfAssessmentElementProps {
  showUniqueId?: boolean
  markAsInEligible?: boolean
  messageType?: string
  message?: string
}

export interface ElementProps extends EndOfAssessmentElementProps{
  storage?: {}
  conditions?: []
  current?: string
}
export interface ElementInterface {
  type: string
  props: ElementProps
  elements: any[]
}

export interface NormalizedTree {
  [key: string]: ElementInterface
}

export interface ResultsInterface {
  [questionId: number]: any
}

export interface QuestionsInterface {
  [questionId: number]: Question
}

export interface LogicInterface {
  conditions?: object[]
}

export interface InProgressQuestion {
  questionId: number,
  progressState: string,
}

interface Options {
  enableSingleQuestionPage?: boolean
}

interface OpitionsData {
  enable_single_question_page?: boolean
}

export interface Highlight {
  id: string,
  assessmentId?: number,
  data: object,
  resourceId: number,
  resourceType: string,
}

export interface DefaultState {
  id?: number
  type: string
  resultsUrl?: string
  randomseed?: string
  initialized: boolean
  isThreesixty: boolean
  enableBack: boolean
  enableProgress: boolean
  enableSingleQuestionPage: boolean
  linear: boolean
  end: boolean
  hideHiddenQuestions: boolean
  ignoreValidations: boolean
  readOnly: boolean
  elements: ElementInterface[]
  hrisData?: {}
  blocks: {[id: number]: Block}
  questions: {[id: number]: Question}
  embeddedData: {[key: string]: any}
  normalizedTree: {[path: string]: ElementInterface}
  allPages: {[blockId: number]: PageInterface[]}
  dbResult?: any
  results: ResultsInterface
  prevPages: {element: string; page: number}[]
  currentElement: string | null
  currentPage: number | null
  errors: {} | null
  dashboardUrl: string
  mediaUrl: string | null
  dataSheetColumns: {[key: string]: {}}[]
  dataSheet: {[key: string]: {}}[]
  subjectDataSheet: { [key: string]: {} }[]
  relationships: string[]
  relationship: string | null
  locales: any
  agileAssetsUrl?: string
  agileAssignUrl?: string
  inProgressQuestions: InProgressQuestion[],
  highlights: {
    [id: string]: Highlight
  },
  assessmentTimedOut: boolean,
  mediaResponses: MediaResponse[] | [],
  showSubmitPage: boolean
  expiryDate: Date | null
  timerDuration: number | null
  isSimulation: boolean
  factors: []
  scoring: {} | null
  showScoringOnEndPage: boolean
  showQuestionScoring: boolean
  activeDictationOnQuestion: number
  options: Options
  backButtonPressed: boolean
  nextButtonPressed: boolean
  started: boolean
  instructions: { enabled: boolean, content: string }
  fixedTimed: boolean
  showErrorWarning: boolean
  isAssessor: boolean
  nextAssessmentUrl?: string | null
  submitRequired: boolean
  otherPendingAssessmentCount: number
  evaluationSessionId: string | null
  invalidSession: boolean
  answersSaved: boolean
  extraOptions: {
    enable_copy_content?: boolean
  }
  pipedTextMapping?: Record<string, string>
}

export interface MediaResponse {
  id: number
  questionId: number
  filename: string
  userSelected: boolean
  url: string
  createdAt: string
  transcriptionText?: string
  transcriptionUrl?: string
  disableTranscriptDownload?: boolean
}

export interface I18nInterface {
  t (code: string, data?: any): string
  lookup(code: string): string
  tQuestion (question: any, field: string, extraData?: any): string
  tBlock (block: any, key: string, path: string[]): string
  tCustomValidation (question: Question, message: string, uuid: string): string
  tInstructions(): string
  uiLocale?: string
}

export interface QuestionErrors {
  [question_id: number]: QuestionError
}

export interface QuestionError {
  type: string
  message: string
  field?: string
}

declare global {
  interface Window {
    I18n: any;
    SomApi: any;
  }
}

export interface InitData {
  id: number
  name: string
  resultsUrl: string
  type: string
  blocks: Block[]
  flow: { elements: ElementInterface[]}
  locale: string
  isThreesixty: boolean
  dashboardUrl: string
  data_sheet_columns: []
  relationships: string[]
  isAnonymousAssessment: boolean
  allow_multiple_responses: boolean
  readOnly: boolean
  enable_back: boolean
  enable_progress: boolean
  enable_single_question_page: boolean
  norm_rules: []
  locales: any
  agileAssetsUrl: string
  agileAssignUrl: string
  timer_duration: number
  notAnEndPage: boolean
  category: string
  showScoringOnEndPage: boolean
  showQuestionScoring: boolean
  factors: []
  options: OpitionsData
  instructions: {enabled: boolean, content: string}
  fixed_timed: boolean
  default_norm_id: number
  isAssessor: boolean
  linked_questions: {[key:string]: number[]}
  evaluationSessionId: string
  extra: {}
  campaign_factors_list: CampaignFactor[]
}
export interface Result {
  id: number
  relationship: string
  current_element: string
  current_page: number
  data_sheet: []
  subject_datasheet: []
  results?: {}
  scoring?: {}
  factors: []
  answers?: {}
  expiry_date: Date
  started_at: Date
  meta_data: {}
  status: string
  timed_out: boolean
  prev_pages: []
  media_responses: []
  hris: {}
  highlights: [{id: string, data: {}, resource_type: string, resource_id: number}]
  next_assessment_url?: string
  other_pending_assessments_count: number
  seedrandom: string
  campaign_options: { fixed_time: boolean }
  campaign_user: { expiry_date: string }
  evaluation_session_id: string
  piped_text_mapping?: Record<string, string>
}

interface SaveResponse {
  expired: boolean
  current_block?: Block
  scoring?: {}
  factors?: [],
  translations?: object
  next_assessment_url?: string
  evaluation_session_id: string
  piped_text_mapping?: object
}

interface FetchQuestionScoringResponse {
  [key: number]: {
    results: {question_id: number, value: number}[]
  }
}

export interface InitType { type: string, data: InitData, result: Result}
export interface AnswerType { type: string, result: any }

export type NextPage = ReturnType<typeof nextPage>
export type PrevPage = ApiActionResponse<{}>
export type AddPrevPage = ReturnType<typeof addPrevPage>
export type SetSubmissionInProgress = ReturnType<typeof setSubmissionInProgress>
export type RemovePrevPage = ReturnType<typeof removePrevPage>
export type ShowErrors = ReturnType<typeof showErrors>
export type EmptyErrors = ReturnType<typeof emptyErrors>
export type ShowPage = ReturnType<typeof showPage>
export type ShowEnd = ReturnType<typeof showEnd>
export type HideEnd = ReturnType<typeof hideEnd>
export type AddQuestionError = ReturnType<typeof addQuestionError>
export type RemoveQuestionError = ReturnType<typeof removeQuestionError>
export type MarkQuestionInProgress = ReturnType<typeof markQuestionInProgress>
export type RemoveQuestionInProgress = ReturnType<typeof removeQuestionInProgress>
export type ClearInProgressQuestion = ReturnType<typeof clearInProgressQuestion>
export type MarkAssessmentTimedOut = ReturnType<typeof markAssessmentTimedOut>

export type ChangeElement = ReturnType<typeof changeElement>
export type HideQuestion = ReturnType<typeof hideQuestion>
export type ShowQuestion = ReturnType<typeof showQuestion>
export type SetEmbeddedData = ReturnType<typeof setEmbeddedData>
export type SetDirtyResults = ReturnType<typeof setDirtyResults>
export type SetNotDirtyResults = ReturnType<typeof setNotDirtyResults>
export type ToggleHiddenQuestions = ReturnType<typeof toggleHiddenQuestions>
export type ToggleIgnoreValidation = ReturnType<typeof toggleIgnoreValidation>
export type Reset = ReturnType<typeof reset>
export type SaveResults = ApiActionResponse<SaveResponse>
export type ShowSubmitPage = ReturnType<typeof showSubmitPage>
export type HideSubmitPage = ReturnType<typeof hideSubmitPage>
export type UpdateHightlight = ApiActionResponse<typeof updateHighlight>

export type AddMediaResponse = ReturnType<typeof addMediaResponse>
export type RemoveMediaResponse = ReturnType<typeof removeMediaResponse>
export type MarkMediaResponseAsSelected = ReturnType<typeof markMediaResponseAsSelected>
export interface AppStore {
  preview: DefaultState
}

export type SetLocalResults = ReturnType<typeof setLocalResults>
export type SetIsSimulation = ReturnType<typeof setIsSimulation>
export type FetchQuestionScoring = ApiActionResponse<FetchQuestionScoringResponse>
export type showErrorWarning = ReturnType<typeof showErrorWarning>
export type SetAnsersSaved = ReturnType<typeof setAnswersSaved>
