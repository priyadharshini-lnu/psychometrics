/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  NEXT_PAGE, PREV_PAGE,
  SHOW_PAGE, SHOW_END, CHANGE_ELEMENT,
  SHOW_ERRORS, EMPTY_ERRORS, SAVE_RESULTS,
  SET_EMBEDDED_DATA, HIDE_QUESTION, ADD_PREV_PAGE,
  REMOVE_PREV_PAGE, SET_DIRTY_RESULTS, SHOW_QUESTION,
  SET_NOT_DIRTY_RESULTS, TOGGLE_HIDDEN_QUESTIONS,
  TOGGLE_IGNORE_VALIDATION, RESET,
  SET_LOCAL_RESULTS,
} from './consts'

export interface Question {
  id: number
  deleted?: boolean
  type?: string
  display_logic?: object
  skip_logic?: object[]
  required_validation?: { enabled: boolean, type: string }
  props?: any
  hidden?: boolean
}

export interface Block {
  id: number;
  deleted?: boolean
  questions: Question[]
  props?: { randomization?, staticContent? }
}

export interface BlocksInterface {
  blocks: Block[]
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

export interface ElementInterface {
  type: string
  props: {
    storage?: {}
    conditions?: []
    current?: string
  }
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

export interface Highlight {
  id: string,
  assessmentId?: number,
  data: object,
  resourceId: number,
  resourceType: string,
}

export interface DefaultState {
  type: string
  resultsUrl?: string
  randomseed?: string
  initialized: boolean
  isThreesixty: boolean
  enableBack: boolean
  enableProgress: boolean
  linear: boolean
  end: boolean
  hideHiddenQuestions: boolean
  ignoreValidations: boolean
  readOnly: boolean
  elements: []
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
  currentPage: number
  errors: {} | null
  dashboardUrl: string
  mediaUrl: string | null
  dataSheetColumns: {[key: string]: {}}[]
  dataSheet: {[key: string]: {}}[]
  subjectDataSheet: { [key: string]: {} }[]
  relationships: []
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
}

export interface MediaResponse {
  id: number
  questionId: number
  filename: string
  userSelected: boolean
  url: string
  createdAt: string
}

export interface I18nInterface {
  t (code: string, data?: any): string
  lookup(code: string): string
  tQuestion (question: any, field: string, extraData?: any): string
  tBlock (block: any, key: string, path: string[]): string
  tCustomValidation (question: Question): string
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

export interface NextPage { type: typeof NEXT_PAGE }
export interface PrevPage { type: typeof PREV_PAGE, request?: object }
export interface AddPrevPage { type: typeof ADD_PREV_PAGE, page: number }
export interface RemovePrevPage { type: typeof REMOVE_PREV_PAGE }
export interface ShowErrors { type: typeof SHOW_ERRORS, errors?: object }
export interface EmptyErrors { type: typeof EMPTY_ERRORS }
export interface ShowPage { type: typeof SHOW_PAGE, page: number }
export interface ShowEnd { type: typeof SHOW_END }

export interface ChangeElement { type: typeof CHANGE_ELEMENT, id: string, page?: number }
export interface HideQuestion { type: typeof HIDE_QUESTION, id: number }
export interface ShowQuestion { type: typeof SHOW_QUESTION, id: number }
export interface SetEmbeddedData { type: typeof SET_EMBEDDED_DATA, data: object }
export interface SetDirtyResults { type: typeof SET_DIRTY_RESULTS, questionIds: number[] }
export interface SetNotDirtyResults { type: typeof SET_NOT_DIRTY_RESULTS, questionIds: number[] }
export interface ToggleHiddenQuestions { type: typeof TOGGLE_HIDDEN_QUESTIONS }
export interface ToggleIgnoreValidation { type: typeof TOGGLE_IGNORE_VALIDATION }
export interface Reset { type: typeof RESET }
export interface SetLocalResults { type: typeof SET_LOCAL_RESULTS, data?: object }
export interface SaveResults { type: typeof SAVE_RESULTS, request?: object }

export interface AppStore {
  preview: DefaultState
}
