/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Question {
  id: number
  deleted?: boolean
  type?: string
  display_logic?: object
  skip_logic?: object[]
  required_validation?: object
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

export interface DefaultState{
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
  inProgressQuestions: InProgressQuestion[]
}

export interface I18nInterface {
  t (code: string, data?: any): string
  tQuestion (question: any, field: string, extraData?: any): string
  tBlock (block: any, key: string, path: string[]): string
  tCustomValidation (question: Question): string
}

declare global {
  interface Window {
    I18n: any;
  }
}
