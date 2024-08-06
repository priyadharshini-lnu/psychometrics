import { useState } from 'react'
import {
  Button,
  Flex,
  Form,
  Select,
  Tree,
  Typography,
} from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import _ from 'lodash'
import { useDebouncedCallback } from 'use-debounce'
import { useResources } from '~/hooks/useResources'
import QuestionList from './QuestionList'
import { CampaignTemplate } from '~/modules/admin/modules/campaigns/core/list'
import { Factor } from '~/modules/admin/modules/campaigns/core/factors'
import styles from './ThreesixtyCampaignFormModal.less'
import { CampaignCreatorSVG } from './CampaignCreatorSVG'

const { Option } = Select

const { I18n } = window

export type Question = {
  id: string;
  name: string;
  type: string;
  factors: {
    props: {
      choice: number;
    }[];
  }[];
  props: {
    choicesTexts: string[];
  };
}

type FactorForTree = {
  key: string;
  title: string;
  id: string;
  children: FactorForTree[];
}

const AdvancedSettingsForm = ({
  campaignTemplates,
  onClose,
  onFinish,
  projectId,
  onBack,
}) => {
  const [form] = Form.useForm()
  const [showFactorsSelect, setShowFactorsSelect] = useState(false)
  const [factorsMap, setFactorsMap] = useState<Map<string, Factor>>(new Map())
  const [checkedFactorsForFactorsTree, setCheckedFactors] = useState<string[]>([])
  const [expandedKeysForFactorsTree, setExpandedKeys] = useState<string[]>([])
  const [factors, setFactors] = useState<Factor[]>([])
  const [selectedFactors, setSelectedFactors] = useState<FactorForTree[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<number | null>(null)
  const [selectedTemplate, setSelectedTempalte] = useState<CampaignTemplate>()
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([])

  const handleFinish = () => {
    const data = {
      factors: checkedFactorsForFactorsTree.map(factorId => parseInt(factorId, 10)),
      questions: selectedQuestions,
      campaign_template_id: `${selectedTemplate?.id}`,
    }
    onFinish(data)
  }

  const resetSettings = () => {
    setSelectedFactors([])
    setFactors([])
    setQuestions([])
    setFactorsMap(new Map())
    setCheckedFactors([])
    setSelectedQuestions([])
  }

  const handleInitialLoad = (assessmentId: string) => {
    collectionAction({
      action: `${assessmentId}/factors`,
      method: 'get',
      apiConfig: {
        include: ['sub_factors', 'parent_factors', 'parent_factors.sub_factors'],
      },
    }).then((data: Factor[]) => {
      if (data.length > 0 && data.length <= 20) {
        setShowFactorsSelect(false)
        handleSelectAllFactors(data, assessmentId)
      } else {
        setShowFactorsSelect(true)
      }
    })
  }

  const handleSelectAllFactors = (factors: Factor[], assessmentId: string) => {
    const newExpandedKeys = new Set<string>()
    const newCheckedIds = new Set<string>()
    const updatedSelectedFactorsMap = new Map<string, FactorForTree>()
    const factorsAndParentFactorsMap = new Map([...factorsMap, ...getAllFactorsAndParentFactors(factors)])
    setFactorsMap(factorsAndParentFactorsMap)
    factors.map((factor) => {
      newCheckedIds.add(`${factor.id}`)
      const haveParentFactor = (factor.parent_factors?.length ?? 0) > 0
      if (haveParentFactor) {
        factor.parent_factors.forEach((parentFactor) => {
          const parentFactorId = `${parentFactor.id}`
          const parentData = modfiedDataForFactorsTree(factorsAndParentFactorsMap.get(parentFactorId))
          newExpandedKeys.add(parentFactorId)
          if (!updatedSelectedFactorsMap.has(parentFactorId)) {
            updatedSelectedFactorsMap.set(parentFactorId, parentData.data)
          }
        })
      } else {
        const modifiedFactorData = modfiedDataForFactorsTree(factor)
        newExpandedKeys.add(modifiedFactorData.data.id)
        updatedSelectedFactorsMap.set(modifiedFactorData.data.id, modifiedFactorData.data)
      }
    })
    setSelectedFactors(Array.from(updatedSelectedFactorsMap.values()))
    const checkedIds = Array.from(newCheckedIds)
    setCheckedFactors(checkedIds)
    setExpandedKeys(Array.from(newExpandedKeys))
    handleFetchQuestions(checkedIds, assessmentId)
  }


  const { collectionAction } = useResources<Factor>(
    'assessments',
    {
      apiConfig: {
        include: ['sub_factors'],
        camelizeOnly: ['name', 'scoring_strategy', 'sub_factors', 'parent_factors'],
      },
      basePath: `projects/${projectId}`,
    },
  )


  const handleFetchFactors = (searchTerm: string) => {
    collectionAction({
      action: `${selectedAssessmentId}/factors`,
      method: 'get',
      apiConfig: {
        include: ['sub_factors', 'parent_factors', 'parent_factors.sub_factors'],
        filter: {
          search_query: searchTerm,
        },
      },
    }).then((data: Factor[]) => {
      const sorteData = sortFactors(data)
      setFactors(sorteData)
      const factorsAndParentFactorsMap = new Map([...factorsMap, ...getAllFactorsAndParentFactors(data)])
      setFactorsMap(factorsAndParentFactorsMap)
    })
  }

  const handleFetchQuestions = (factorIds: string[], assessmentId: string | number | null) => {
    if (assessmentId) {
      collectionAction({
        action: `${assessmentId}/factors/questions`,
        method: 'get',
        apiConfig: {
          filter: {
            factor_ids: factorIds,
          },
        },
      }).then((data: Question[]) => {
        setQuestions(data)
      })
    }
  }

  const debouncedOnFactorSearch = useDebouncedCallback((searchTerm: string) => {
    handleFetchFactors(searchTerm)
  }, 500)

  const handleSearch = (searchTerm: string) => {
    if (searchTerm) {
      debouncedOnFactorSearch(searchTerm)
    }
  }

  const handleCheckForFactorsTree = (checkedKeys: string[]) => {
    setCheckedFactors(checkedKeys)
    handleFetchQuestions(checkedKeys, selectedAssessmentId)
  }

  const handleFactorChange = (value: string) => {
    const newSelectedFactors = modfiedDataForFactorsTree(factorsMap.get(value))
    form.setFieldValue('factors', null)
    const newCheckedIds = [...checkedFactorsForFactorsTree, value, ...newSelectedFactors.subFactorsIds]
    setCheckedFactors(newCheckedIds)
    handleFetchQuestions(newCheckedIds, selectedAssessmentId)

    const isParentFactor = (factorsMap.get(value)?.parent_factors?.length ?? 0) > 0
    const updatedSelectedFactorsMap = new Map(selectedFactors.map(factor => [factor.id, factor]))
    const newExpandedKeys = new Set(expandedKeysForFactorsTree)

    if (isParentFactor) {
      const parentFactors = factorsMap.get(value)?.parent_factors
      parentFactors?.forEach((parentFactor) => {
        const parentData = modfiedDataForFactorsTree(factorsMap.get(parentFactor.id))
        newExpandedKeys.add(parentData.data.id)
        if (!updatedSelectedFactorsMap.has(parentFactor.id)) {
          updatedSelectedFactorsMap.set(parentFactor.id, parentData.data)
        }
      })
    } else {
      newExpandedKeys.add(value)
      updatedSelectedFactorsMap.set(newSelectedFactors.data.id, newSelectedFactors.data)
    }
    setExpandedKeys(Array.from(newExpandedKeys))
    setSelectedFactors(Array.from(updatedSelectedFactorsMap.values()))
  }

  const handleCampaignTemplateChange = (campaignTemplateId: number) => {
    const campaignTemplate = _.find(campaignTemplates,
      (campaignTemplate: CampaignTemplate) => campaignTemplate.id === campaignTemplateId)
    setSelectedTempalte(campaignTemplate)
    if (campaignTemplate) {
      handleAssessmentChange(campaignTemplate.assessmentId)
      handleInitialLoad(campaignTemplate.assessmentId)
    }
  }

  const handleAssessmentChange = (assessmentId: number) => {
    setSelectedAssessmentId(assessmentId)
    resetSettings()
  }

  const handleSelectQuestions = (selectedQuestions: string[]) => {
    setSelectedQuestions(selectedQuestions)
  }

  const emptyRHS = (
    <Flex vertical gap={16} justify="center" align="center">
      <Flex vertical style={{ width: '200px', height: '200px' }} justify="center" align="center">
        <CampaignCreatorSVG />
      </Flex>
      <Flex vertical style={{ maxWidth: '600px' }} justify="center" align="center">
        <Typography.Title level={2} style={{ margin: 0 }}>
          {I18n.t(
            'administration.campaigns.modals.create_threesixity.instructions_customization.title',
          )}
        </Typography.Title>
        <Typography.Title level={5} style={{ margin: 0 }}>
          {I18n.t(
            'administration.campaigns.modals.create_threesixity.instructions_customization.sub_title',
          )}
        </Typography.Title>
      </Flex>
    </Flex>
  )

  return (
    <Form
      layout="vertical"
      form={form}
      className="h-100"
      onFinish={handleFinish}
    >
      <Flex vertical className="h-100">
        <Flex flex="auto" className="h-100" style={{ overflow: 'hidden' }}>
          <Flex gap={8} vertical className="w-100 p-8" style={{ maxWidth: 360, overflow: 'auto' }}>
            <Form.Item
              name="campaign_template_id"
              label="Campaign template"
              rules={[{ required: true }]}
            >
              <Select onChange={handleCampaignTemplateChange}>
                {_.map(campaignTemplates, (template: CampaignTemplate) => (
                  <Option key={template.id} value={template.id}>{template.name}</Option>))}
              </Select>
            </Form.Item>
            {showFactorsSelect && (
            <Form.Item
              name="factors"
              label="Factors"
            >
              <Select
                onSearch={handleSearch}
                showSearch
                suffixIcon={<SearchOutlined />}
                filterOption={false}
                onChange={handleFactorChange}
                options={(factors || []).map(f => ({
                  value: f.id,
                  label: f.sub_factors?.length ? <b>{f.name}</b> : f.name,
                }))}
              />
            </Form.Item>
            )}
            <Tree
              checkable
              expandedKeys={expandedKeysForFactorsTree}
              onCheck={handleCheckForFactorsTree}
              checkedKeys={checkedFactorsForFactorsTree}
              treeData={selectedFactors}
            />
          </Flex>
          <Flex
            flex="auto"
            vertical
            className={`${styles.borderLeft} ${styles.rhsCtr} ${questions.length ? '' : styles.background}`}
            justify="center"
            align="center"
          >
            {questions.length ? (
              <QuestionList questions={questions} onSelect={handleSelectQuestions} />
            ) : emptyRHS}
          </Flex>
        </Flex>
        <Flex className={`w-100 p-8 ${styles.borderTop}`} gap={8} justify="flex-end">
          <Button key="back" onClick={onBack}>
            {I18n.t('administration.common.back')}
          </Button>
          <Button key="cancel" onClick={onClose}>
            {I18n.t('administration.common.cancel')}
          </Button>
          <Button
            key="submit"
            type="primary"
            htmlType="submit"
          >
            {I18n.t('administration.common.save')}
          </Button>
        </Flex>
      </Flex>
    </Form>
  )
}

export default AdvancedSettingsForm


const getAllFactorsAndParentFactors = (factors: Factor[]) => {
  const factorsAndParentFactorsMap = new Map()
  factors.forEach((factor) => {
    factorsAndParentFactorsMap.set(factor.id, factor)
    factor.parent_factors?.forEach((parentFactor) => {
      factorsAndParentFactorsMap.set(parentFactor.id, parentFactor)
    })
  })
  return factorsAndParentFactorsMap
}

const sortFactors = (factors: Factor[]) => factors.sort((a, b) => {
  if (a.parent && !b.parent) {
    return -1
  }
  if (!a.parent && b.parent) {
    return 1
  }
  return a.name.localeCompare(b.name)
})


const modfiedDataForFactorsTree = (factor): {data: FactorForTree, subFactorsIds : string[] } => {
  const subFactorsIds: string[] = []
  const subFactors = factor?.sub_factors?.map((subFactor) => {
    subFactorsIds.push(subFactor.id)
    return ({
      key: subFactor.id,
      title: subFactor.name,
      id: subFactor.id,
    })
  })
  return {
    data: {
      key: factor.id,
      title: factor.name,
      id: factor.id,
      children: subFactors,
    },
    subFactorsIds,
  }
}
