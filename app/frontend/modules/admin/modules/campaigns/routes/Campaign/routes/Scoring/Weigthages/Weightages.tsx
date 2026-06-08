import { useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Button, Flex, Form, Input, Space, Table, App,
} from 'antd'
import { PageHeader } from '@ant-design/pro-components'
import _ from 'lodash'
import { ColumnProps } from 'antd/es/table'
import styles from './styles.less'
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

type factorWeightage = {
  value: number | null;
  disabled: boolean;
}

type DataType = {
  assessmentName: string;
  [key: string]: factorWeightage | string | number ;
}

export function Weightages () {
  const { projectId, campaignId } = useParams() as { projectId: string, campaignId: string }
  const navigate = useNavigate()
  const { message } = App.useApp()

  const [form] = Form.useForm()
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
    collectionAction: updateFactorWeightages,
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


  const handleSubmit = async () => {
    const formValues = form.getFieldsValue(true)
    const payload = _.flatMap(formValues, (
      factors: { [factorId: string]: string | null },
      assessmentId: string,
    ) => _.chain(factors)
      .pickBy(value => value !== null)
      .map((value, factorId) => ({
        assessment_id: assessmentId,
        factor_id: factorId,
        weight: parseFloat(value as string),
      }))
      .value())

    updateFactorWeightages({
      action: 'bulk_upsert',
      method: 'post',
      body: {
        data: payload,
      },
    }).then(() => {
      message.success(I18n.t('admin.scoring_weightages_successful_update'))
    })
  }

  const handleReset = () => {
    form.resetFields()
  }

  return (
    <>
      <PageHeader
        className={styles.pageHeader}
        onBack={() => navigate(`/admin/projects/${projectId}/new_campaigns/${campaignId}/scoring/settings`)}
        title={<Space>{I18n.t('admin.scoring_weightages_weightages')}</Space>}
      />
      <Form form={form} onFinish={handleSubmit}>
        <Table columns={columns} dataSource={dataSource} pagination={false} scroll={{ x: 'max-content' }} />
        <Form.Item>
          <Flex justify="flex-end" gap={8} style={{ padding: '2rem' }}>
            <Button onClick={handleReset}>
              {I18n.t('shared.reset')}
            </Button>
            <Button
              type="primary"
              htmlType="submit"
            >
              {I18n.t('shared.save')}
            </Button>
          </Flex>
        </Form.Item>
      </Form>
    </>
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
    rowData[factorId] = {
      value: factorExists ? weightData : null,
      disabled: !factorExists,
    }
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
    render: (_, record) => {
      const inputProps = record[factorId] as factorWeightage
      return (
        <Form.Item<{}> // TODO: I don't know why is getting wrong type
          name={[record.key, factorId]}
          initialValue={inputProps?.value}
          noStyle
        >
          <Input disabled={inputProps.disabled} />
        </Form.Item>
      )
    },
  }))

  return [...baseColumns, ...factorColumns]
}
