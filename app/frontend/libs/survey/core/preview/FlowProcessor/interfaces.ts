/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Question {
  id: number;
  deleted?: boolean;
  type?: string;
  display_logic?: object;
  skip_logic?: object[];
}

export interface Block {
  id: number;
  deleted?: boolean;
  questions: Question[];
  props?: { randomization? };
}

export interface BlocksInterface {
  blocks: Block[];
}
export interface PageInterface {
  questions: number[];
  blockId: number;
  skipLogic?: {};
}
export interface ElementInterface {
  type: string;
  props: {
    current?: string;
    storage?: {};
  };
  elements: any[];
}

export interface NormalizedTree {
  [key: string]: ElementInterface;
}

export interface ResultsInterface {
  [questionId: number]: any;
}

export interface DefaultState{
  type: string;
  resultsUrl?: string;
  randomseed?: string;
  initialized: boolean;
  isThreesixty: boolean;
  enableBack: boolean;
  enableProgress: boolean;
  linear: boolean;
  end: boolean;
  elements: [];
  hrisData?: {};
  blocks: {[id: number]: Block};
  questions: {[id: number]: Question};
  embeddedData: {[key: string]: any};
  normalizedTree: {[path: string]: ElementInterface};
  allPages: {[blockId: number]: PageInterface[]};
  dbResult?: any;
  results: ResultsInterface;
  prevPages: {element: string; page: number}[];
  currentElement: string | null;
  currentPage: number;
  errors: {} | null;
}
