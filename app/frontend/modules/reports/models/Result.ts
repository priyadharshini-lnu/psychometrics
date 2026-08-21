import _ from 'lodash'
import SetInnovationStyles from '~/modules/reports/models/Results/SetInnovationStyles'
import { getQuestions } from '~/modules/reports/core/builder/selectors'
import { MediaResponse } from '~/modules/survey/core/preview/FlowProcessor/interfaces'
import { InnovationStyleResult, OccupationResult } from '~/modules/reports/models/Results/interfaces/RawResult'
import SetOccupations from '~/modules/reports/models/Results/SetOccupations'
import AppStore from '../store/AppStore'
import Filter from './Filter'
import store from '../store'

import {
  RawResult,
  ResultsByFilter,
  QuestionScoringObject,
  EmbeddedData,
  UsersScoring,
  ResultScoring,
  ScoringByQuestion,
  TopFactor,
  AverageFactor,
  OccupationFactor,
  QuestionScoringWithoutFactorsObject,
  TopFactorType,
  UserReportData,
  CampaignFactorResults,
} from './Results/interfaces'

import {
  GetAverageFactorScore,
  GetOccupationByRank,
  GetQuestionScoringWithoutFactors,
  GetTopFactors,
  GetTopCampaignFactors,
  SetDataSheet,
  SetReportData,
  SetEmbeddedData,
  SetExternalScoring,
  SetGroupedDataSheet,
  SetQuestions,
  SetScoring,
  SetScoringByQuestion,
  SetUsersScoring,
  SetMediaResponses,
  SetAIMetadataByQuestion,
} from './Results'
import { AIMetadataByQuestion } from './Results/SetAIMetadataByQuestion'

// Attention!!!! it is hack. Used for individual response
// Individual values stored in this.resultsByFilter['individual']
const INDIVIDUAL_FILTER = {
  id: 'individual',
  name: 'individual',
  conditions: [{ type: 'RelationShip', props: { predicate: 'Is', value: 'Self' } }],
}

const ASSESSOR_FILTER = {
  id: 'assessor',
  name: 'assessor',
  conditions: [{ type: 'RelationShip', props: { predicate: 'Is', value: 'Assessor' } }],
}

export default class Result<ExternalScoring = unknown> {
  // name: string
  user: object

  rawResults: RawResult[]

  userReportData: UserReportData | null

  notFilteredResults: RawResult[]

  mediaResponses: MediaResponse[]

  dimensionId: number

  assessmentId: number

  resultsByFilter: ResultsByFilter

  externalScoring: ExternalScoring

  dataSheet: object

  campaignFactorResults: CampaignFactorResults

  reportData: object

  questions: QuestionScoringObject

  embeddedData: EmbeddedData

  usersScoring: UsersScoring

  scoring: ResultScoring

  questionScoring: ScoringByQuestion

  occupations: OccupationResult[]

  innovationStyles: InnovationStyleResult[]

  aiMetadataByQuestion: AIMetadataByQuestion

  groupedDataSheet: object[]

  constructor (assessmentId: number) {
    this.assessmentId = assessmentId
    this.dimensionId = _.find(AppStore.assessments, { id: this.assessmentId })?.dimensionId
    this.resultsByFilter = {}
    this.embeddedData = {}
    this.dataSheet = {}
    this.campaignFactorResults = []
    this.reportData = {}
    this.groupedDataSheet = []
  }

  // toJSON = () => ({ name: this.name, filters: this.filters })

  init = (
    results: RawResult[],
    user: object,
    filters: Filter[] | null,
    notFilteredResults: RawResult[] = [],
    userReportData: UserReportData | null = null,
    campaignFactorResults: CampaignFactorResults = [],
  ): Result => {
    filters = this.addIndividualFilter(filters)
    this.user = user
    _.each(filters, (filter: Filter) => {
      this.initResultsByFilter(results, filter)
    })
    this.rawResults = results
    this.userReportData = userReportData
    this.notFilteredResults = notFilteredResults
    this.scoring = SetScoring.run(this.rawResults, this.dimensionId)
    this.occupations = SetOccupations.run(this.rawResults)
    this.innovationStyles = SetInnovationStyles.run(this.rawResults)
    this.questionScoring = SetScoringByQuestion.run(this.rawResults, this.dimensionId)
    this.embeddedData = SetEmbeddedData.run(this.rawResults)
    this.questions = SetQuestions.run(this.rawResults)
    this.usersScoring = SetUsersScoring.run(this.rawResults)
    this.externalScoring = SetExternalScoring.run(this.rawResults)
    this.dataSheet = SetDataSheet.run(this.user as {datasheet: object})
    this.campaignFactorResults = campaignFactorResults
    this.reportData = SetReportData.run(this.userReportData)
    this.groupedDataSheet = SetGroupedDataSheet.run(this.rawResults)
    this.mediaResponses = SetMediaResponses.run(this.rawResults)
    this.aiMetadataByQuestion = SetAIMetadataByQuestion.run(this.rawResults, this.dimensionId)

    if (_.isEmpty(filters)) return this

    // TODO (atanych): remove. Already is created the corresponding task
    this.calcOccupationsStars()
    this.sortOccupations()
    this.calcInnovationStylesScore()
    return this
  }

  addIndividualFilter = (filters: Filter[] | null): Filter[] => filters
    ?.concat(new Filter(INDIVIDUAL_FILTER)).concat(new Filter(ASSESSOR_FILTER)) || []

  initResultsByFilter = (results: RawResult[], filter: Filter): void => {
    const rawResults = results.filter(data => filter.correctByFilter(data))
    let filteredResults = [...rawResults]
    if (rawResults.length < filter.minRequiredResponses) {
      filteredResults = []
    }
    this.resultsByFilter[filter.id] = (new Result(this.assessmentId)).init(
      filteredResults,
      this.user,
      null,
      rawResults,
      this.userReportData,
      this.campaignFactorResults,
    )
  }

  sortOccupations = (): void => {
    AppStore.sortedOccupations[this.dimensionId] = _.orderBy(
      AppStore.occupations[this.dimensionId], ['value', 'name'], ['desc', 'asc'],
    )
  }

  calcOccupationsStars = (): void => {
    const occupationResult = this.resultsByFilter.individual.occupations || []
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _.each(AppStore.occupations[this.dimensionId], (oc: any) => {
      oc.stars = occupationResult.find((or: OccupationResult) => or.id === oc.id)?.stars || 0
      oc.value = occupationResult.find((or: OccupationResult) => or.id === oc.id)?.value || 0
    })
  }

  calcInnovationStylesScore = (): void => {
    const innovationStyleResult = this.resultsByFilter.individual.innovationStyles || []
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _.each(AppStore.innovationStyles[this.dimensionId], (is: any) => {
      is.score = innovationStyleResult.find((ir: InnovationStyleResult) => ir.id === is.id)?.value || 0
    })
  }


  getTopFactors = (
    from: number,
    to: number,
    factorIds: number[],
    factorType: TopFactorType,
    minValue?,
    maxValue?,
    relationship?,
    includesCurrentJob?: boolean,
    includesTargetJob?: boolean,
  ): TopFactor[] => GetTopFactors.run(
    from, to, factorIds, factorType, this.resultsByFilter,
    this.dimensionId, minValue ?? -Infinity, maxValue ?? Infinity, relationship,
    includesCurrentJob, includesTargetJob,
  )

  getTopCampaignFactors = (
    from: number,
    to: number,
    campaignFactorCodes: string[],
    minValue?,
    maxValue?,
  ): { code: string, value: number }[] => GetTopCampaignFactors.run(
    from, to, this.campaignFactorResults, campaignFactorCodes, minValue ?? -Infinity, maxValue ?? Infinity,
  )

  getBranchData = (filterId: string | null, branchName: string): ResultScoring => {
    if (_.isNull(filterId)) return this[branchName] || {}
    if (filterId && this.resultsByFilter[filterId]) return this.resultsByFilter[filterId][branchName] || {}
    return {}
  }

  // eslint-disable-next-line arrow-body-style
  getAverageFactorScore = (filterId: string): AverageFactor[] => {
    return GetAverageFactorScore.run(this.getBranchData(filterId, 'scoring'), this.dimensionId)
  }


  getTopSubFactors = (from: number, to: number, factorId: number): TopFactor[] => {
    const subFactorIds = _.get(AppStore.mapSubfactorIdsByFactor, [this.dimensionId, factorId], [])
    return GetTopFactors.run(from, to, subFactorIds, TopFactorType.SubFactor, this.resultsByFilter, this.dimensionId)
  }

  getTopFactorByRank = (rank: number): TopFactor => {
    const factorIds = AppStore.subfactors[this.dimensionId].map(f => f.id)
    return GetTopFactors.run(rank, rank, factorIds, TopFactorType.SubFactor, this.resultsByFilter, this.dimensionId)[0]
  }

  getCampaignFactorValue = (code): {outputType: string, name: string, code: string} => {
    const factorNames = _.keyBy(AppStore.report.campaignFactors, 'code')
    return factorNames[code]
  }


  // eslint-disable-next-line arrow-body-style
  getOccupationByRank = (rank: number): OccupationFactor[] | null => {
    return GetOccupationByRank.run(rank, this.resultsByFilter, this.dimensionId)
  }

  getOccupations = (): object => AppStore.occupations[this.dimensionId]

  getInnovationStyles = (): object[] => AppStore.innovationStyles[this.dimensionId]

  getByFilter = (filterId: string): Result => {
    if (this.resultsByFilter[filterId]) {
      return this.resultsByFilter[filterId]
    }
    // if filter is not found, return all responses
    return this
  }

  questionScoringWithoutFactors = (filterId: string): QuestionScoringWithoutFactorsObject => {
    const questionScoring = this.getBranchData(filterId, 'questionScoring')
    const questions = getQuestions(store.getState().report, this.assessmentId)
    return GetQuestionScoringWithoutFactors.run(this.assessmentId, questionScoring, this.dimensionId, questions)
  }
}

export interface SavilleScore {
  id: string
  score_type: string
  value_type: string
  score: number
}
