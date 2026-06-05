import { useMemo } from 'react'
import keyBy from 'lodash/keyBy'
import {
  IFiveScaleRowData,
  NormEditor,
} from '~/modules/admin/modules/client/core/norms'

const { I18n } = window

type NormScoreFields = Omit<IFiveScaleRowData, 'factor' | 'key' | 'factorsNormId'>

type PercentileFactorNorms = {
  mean: string | undefined;
  standardDeviation: string | undefined;
}

type FiveScaleFactorNorms = {
    level: string;
    scoreFrom: string | number;
    scoreTo: string | number;
}

const formatNumberWithPrecision = (value: number) => value.toLocaleString('en-US', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 10,
})

const formatScoreValue = (value?: string | number): string => (
  value || value === 0 ? formatNumberWithPrecision(parseFloat(String(value))) : ''
)

const LEVEL_FIELD_MAP: [string, keyof NormScoreFields, keyof NormScoreFields][] = [
  ['verylow', 'veryLowFrom', 'veryLowTo'],
  ['low', 'lowFrom', 'lowTo'],
  ['average', 'averageFrom', 'averageTo'],
  ['high', 'highFrom', 'highTo'],
  ['veryhigh', 'veryHighFrom', 'veryHighTo'],
]

const buildNormScores = (factorsNormsProps: FiveScaleFactorNorms[]): NormScoreFields => {
  const propsByLevel = keyBy(factorsNormsProps ?? [], prop => (prop.level ?? '').toLowerCase().replace(/\s/g, ''))

  return LEVEL_FIELD_MAP.reduce<NormScoreFields>((scores, [levelKey, fromField, toField]) => {
    const prop = propsByLevel[levelKey]
    scores[fromField] = formatScoreValue(prop?.scoreFrom)
    scores[toField] = formatScoreValue(prop?.scoreTo)
    return scores
  }, {
    veryLowFrom: '',
    veryLowTo: '',
    lowFrom: '',
    lowTo: '',
    averageFrom: '',
    averageTo: '',
    highFrom: '',
    highTo: '',
    veryHighFrom: '',
    veryHighTo: '',
  })
}


const buildPercentileNormScores = (factorsNormsProps: PercentileFactorNorms[]):
PercentileFactorNorms => {
  const scores = {
    mean: formatScoreValue(factorsNormsProps?.[0]?.mean),
    standardDeviation: formatScoreValue(factorsNormsProps?.[0]?.standardDeviation),
  }

  return scores
}


export const useNormsTableConfig = (normType: string | undefined, editorData: NormEditor = []) => {
  const defaultColumns = [{
    title: I18n.t('admin.factors'),
    key: 'factor',
    fixed: 'start',
    width: 200,
    dataIndex: 'factor',
    editable: false,
  },
  {
    title: I18n.t('admin.very_low'),
    children: [{
      key: 'veryLowFrom',
      dataIndex: 'veryLowFrom',
      title: I18n.t('admin.from'),
      width: 100,
      editable: true,
    },
    {
      key: 'veryLowTo',
      dataIndex: 'veryLowTo',
      title: I18n.t('admin.to'),
      width: 100,
      editable: true,
    }],
  },
  {
    title: I18n.t('admin.low'),
    children: [{
      key: 'lowFrom',
      title: I18n.t('admin.from'),
      width: 100,
      dataIndex: 'lowFrom',
      editable: true,
    },
    {
      key: 'lowTo',
      title: I18n.t('admin.to'),
      width: 100,
      dataIndex: 'lowTo',
      editable: true,
    }],
  },
  {
    title: I18n.t('admin.average'),
    children: [{
      key: 'averageFrom',
      title: I18n.t('admin.from'),
      width: 100,
      dataIndex: 'averageFrom',
      editable: true,
    },
    {
      key: 'averageTo',
      title: I18n.t('admin.to'),
      width: 100,
      dataIndex: 'averageTo',
      editable: true,
    }],
  },
  {
    title: I18n.t('admin.high'),
    children: [{
      key: 'highFrom',
      title: I18n.t('admin.from'),
      width: 100,
      dataIndex: 'highFrom',
      editable: true,
    },
    {
      key: 'highTo',
      title: I18n.t('admin.to'),
      width: 100,
      dataIndex: 'highTo',
      editable: true,
    }],
  },
  {
    title: I18n.t('admin.very_high'),
    children: [{
      key: 'veryHighFrom',
      title: I18n.t('admin.from'),
      width: 100,
      dataIndex: 'veryHighFrom',
      editable: true,
    },
    {
      key: 'veryHighTo',
      title: I18n.t('admin.to'),
      width: 100,
      dataIndex: 'veryHighTo',
      editable: true,
    }],
  }]

  const percentileColumns = [{
    title: I18n.t('admin.factors'),
    key: 'factor',
    fixed: 'start',
    width: 200,
    dataIndex: 'factor',
    editable: false,
  },
  {
    title: I18n.t('admin.mean'),
    key: 'mean',
    fixed: 'start',
    width: 80,
    dataIndex: 'mean',
    editable: true,
  },
  {
    title: I18n.t('admin.standard_deviation'),
    key: 'standardDeviation',
    width: 80,
    dataIndex: 'standardDeviation',
    editable: true,
  }]

  const data = useMemo(() => {
    const isPercentile = normType === 'percentile'

    return editorData.map(item => ({
      factor: item.name,
      ...(isPercentile
        ? buildPercentileNormScores(item.factorsNormsProps as PercentileFactorNorms[])
        : buildNormScores(item.factorsNormsProps as FiveScaleFactorNorms[])),
      key: item.id.toString(),
      factorsNormId: item.factorsNormId ?? '',
    }))
  }, [editorData, normType])

  const getColumnsBasedOnNormType = (normType: string | undefined) => {
    if (!normType) return []

    return normType === 'percentile' ? percentileColumns : defaultColumns
  }

  return {
    columns: getColumnsBasedOnNormType(normType),
    data,
  }
}
