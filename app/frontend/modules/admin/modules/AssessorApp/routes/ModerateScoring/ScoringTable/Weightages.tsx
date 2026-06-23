import { useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import {
  Table,
} from 'antd'
import _ from 'lodash'
import { ColumnProps } from 'antd/es/table'
import { useResources } from '~/hooks/useResources'
import { Weightage } from '~/modules/admin/modules/campaigns/core/combinedScoring'

const { I18n } = window

type Assessment = {
  id: string;
  assessmentName: string;
  assessmentId: string;
  factors: Factor[];
}

type Factor = {
  id: string;
  name: string;
}

type FactorsMap = Record<string, Factor>;
type WeightagesMap = Record<string, Record<string, number>>;

type DataType = {
  assessmentName: string;
  [key: string]: string | number | null;
}

export function Weightages () {
  const { campaignId } = useParams() as { projectId: string, campaignId: string }

  const {
    data: campaignAssessmentsData,
    fetch: fetchCampaignAssessments,
  } = useResources<Assessment>('campaign_assessor_assessments', {
    basePath: `campaigns/${campaignId}`,
    apiConfig: {
      include: ['factors'],
    },
  })

  const {
    data: FactorWeightagesData,
    fetch: fetchFactorWeightages,
  } = useResources<Weightage>('campaign_assessor_assessment_factor_weights', {
    basePath: `campaigns/${campaignId}`,
  })

  useEffect(() => {
    fetchCampaignAssessments()
    fetchFactorWeightages()
  }, [])

  const factorsMap: FactorsMap = useMemo(() => createFactorsMap(campaignAssessmentsData), [campaignAssessmentsData])
  const weightagesMap: WeightagesMap = useMemo(() => createWeightagesMap(FactorWeightagesData),
    [FactorWeightagesData])
  const columns = useMemo(() => createColumns(factorsMap), [factorsMap])
  const dataSource: DataType[] = useMemo(() => createDataSource(campaignAssessmentsData, factorsMap, weightagesMap),
    [campaignAssessmentsData, factorsMap, weightagesMap])

  return (
    <Table columns={columns} dataSource={dataSource} pagination={false} scroll={{ x: 'max-content' }} />
  )
}


const createWeightagesMap = (weightagesData: Weightage[]): WeightagesMap => weightagesData.reduce((
  acc,
  {
    weight,
    assessment,
    factor,
  },
) => {
  _.set(acc, [assessment.id, factor.id], weight)
  return acc
}, {})

const createFactorsMap = (campaignData: Assessment[]): FactorsMap => campaignData.reduce((
  acc: FactorsMap,
  assessment,
) => {
  assessment.factors.forEach((factor) => {
    acc[factor.id] = factor
  })
  return acc
}, {})

const createDataSource = (
  campaignData: Assessment[],
  factors: FactorsMap,
  weightages: WeightagesMap,
): DataType[] => _.map(campaignData, (assessment) => {
  const rowData: DataType = {
    key: assessment.assessmentId,
    assessmentName: assessment.assessmentName,
  }

  _.forEach(factors, (factor, factorId) => {
    const weightData = _.get(weightages, [assessment.assessmentId, factorId], 1)
    const factorExists = _.some(assessment.factors, { id: factorId })
    rowData[factorId] = factorExists ? weightData : null
  })

  return rowData
})

const createColumns = (factors: FactorsMap): ColumnProps<DataType>[] => {
  const baseColumns: ColumnProps<DataType>[] = [
    {
      title: I18n.t('admin.scoring_weightages_assessorForms'),
      dataIndex: 'assessmentName',
      key: 'assessmentName',
      fixed: 'left',
    },
  ]

  const factorColumns = _.map(factors, (factor, factorId): ColumnProps<DataType> => ({
    title: factor.name,
    dataIndex: factorId,
    key: factorId,
  }))

  return [...baseColumns, ...factorColumns]
}
