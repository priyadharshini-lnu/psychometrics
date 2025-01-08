/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import _ from 'lodash'
import { denormalize } from 'normalizr'
import { camelizeKeys } from '~/utils/object'
import {
  module, page, pages, blocks as blocksSchema,
} from '~/modules/reports/store/schema'
import QuestionModel from '~/modules/reports/models/Question'
import { RootState } from '~/modules/reports/core/rootReducers'
import ModuleInterface from '../interfaces/Module'
import PageInterface from '../interfaces/Page'

export const getModules = (state: any, ids: number[]): ModuleInterface[] => denormalize(ids, [module], state)

export const getModule = (state: any, id: number): ModuleInterface => state.modules[id]

export const getRenderModules = (state: any, id: number) => {
  const { pages, currentPage } = state.builder
  const index = _.indexOf(pages, currentPage)
  return _.includes([pages[index - 1], pages[index], pages[index + 1]], id)
}

export const getModulesShowOnAll = (state: any): ModuleInterface[] => _.filter(
  state.modules, m => m.props.showOnAllPages && !m.removed,
)

export const getSelected = (state: any) => state.selected

export const getPages = (state: any, ids: number[]): PageInterface[] => denormalize(ids, [page], state)
export const getPage = (state: any, id: number): PageInterface => (
  _.first(denormalize([id], [pages], state)) as PageInterface
)

export const getCurrentPage = (state: any): number => state.pages[state.builder.currentPage]
export const getBufferedModule = (state: any): ModuleInterface => state.modules[state.builder.buffer.moduleId]

const FILTER_QUESTION_TYPES = [
  'PageBreak',
  'StaticContent',
  'MetaInfo',
  'Captcha',
  'FileUpload',
  'AudioResponse',
]

export const getQuestions = (state: RootState['report'], assessmentId: number) => {
  const assessment = state.builder.assessments[assessmentId]
  if (!assessment) { return {} }
  const blocks = denormalize(assessment.blocks, [blocksSchema], state.builder)
  return _.reduce(blocks, (acc, block) => {
    const questions = _.filter(block.questions, q => !_.includes(
      FILTER_QUESTION_TYPES, q.type,
    )).reduce((acc, q) => ({ ...acc, [q.id]: new QuestionModel(q) }), {})
    return { ...acc, ...questions }
  }, {})
}


export const getEmbeddedData = (state: any, assessmentId: number) => {
  const parse = elements => _.reduce(elements, (acc: any, element) => {
    if (element.type === 'EmbeddedData') {
      _.map(element.props.storage, (el) => {
        acc = [...acc, { name: el.key, value: el.key, label: el.key }]
      })
    }
    if (element.elements.length > 0) {
      return [...acc, ...parse(element.elements)]
    }
    return acc
  }, [])

  const { flow: { elements } } = state.builder.assessments[assessmentId]
  return parse(elements || [])
}

export const getAllFactors = (state: any) => state?.builder?.factors ?? []

export const getAllAssessments = (state: any) => state?.builder?.assessments ?? {}

export const getAssessmentFactors = (state: RootState, assessmentId: number) => (
  state.report.builder.factors[state.report.builder.assessments[assessmentId]?.dimension_id] || []
)

export const getFlatFactors = (state: RootState) => _.reduce(
  state.report.builder.factors, (result, value) => [...result, ...value], [],
)

export const getCampaignFactors = (state: RootState) => (
  camelizeKeys(state.report.builder.campaign_factors) || []
)
