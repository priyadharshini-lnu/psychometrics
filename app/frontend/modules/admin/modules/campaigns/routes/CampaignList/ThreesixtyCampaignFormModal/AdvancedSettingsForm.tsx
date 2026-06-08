import { Key, useEffect, useState } from 'react'
import {
  Button,
  Flex,
  Form,
  Select,
  Space,
  Tree,
  Typography,
} from 'antd'
import _ from 'lodash'
import { useDebouncedCallback } from 'use-debounce'
import {
  SearchOutlined, ContainerOutlined, LoadingOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
import { useResources } from '~/hooks/useResources'
import QuestionList from './QuestionList'
import { CampaignTemplate } from '~/modules/admin/modules/campaigns/core/list'
import { Factor } from '~/modules/admin/modules/campaigns/core/factors'
import styles from './ThreesixtyCampaignFormModal.less'
import { CampaignCreatorSVG } from './CampaignCreatorSVG'

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
  isSubmitting = false,
}) => {
  const [form] = Form.useForm()
  const [showFactorsSelect, setShowFactorsSelect] = useState(false)
  const [factorsMap, setFactorsMap] = useState<Map<string, Factor>>(new Map())
  const [checkedFactorsForFactorsTree, setCheckedFactorsForFactorsTree] = useState<string[]>([])
  const [expandedKeysForFactorsTree, setExpandedKeys] = useState<string[]>([])
  const [factors, setFactors] = useState<Factor[] | null>(null)
  const [selectedFactors, setSelectedFactors] = useState<FactorForTree[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<number | null>(null)
  const [selectedTemplate, setSelectedTempalte] = useState<CampaignTemplate>()
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([])
  const [campaignTemplatesData, setCampaignTemplatesData] = useState<CampaignTemplate[]>(campaignTemplates)
  const [templateSearchterm, setTemplateSearchterm] = useState('')
  const [isFactorsLoading, setIsFactorsLoading] = useState(false)


  useEffect(() => {
    if (campaignTemplates.length) {
      handleTemplateSearch(templateSearchterm)
    }
  }, [campaignTemplates])

  const handleFinish = () => {
    const factors = checkedFactorsForFactorsTree.map((factorId) => {
      const id = factorId.split('_').pop()
      return id ? parseInt(id, 10) : null
    }).filter(id => id !== null)
    const data = {
      factors,
      questions: selectedQuestions,
      campaign_template_id: `${selectedTemplate?.id}`,
    }
    onFinish(data)
  }

  const resetSettings = () => {
    setSelectedFactors([])
    setFactors(null)
    setQuestions([])
    setFactorsMap(new Map())
    setCheckedFactorsForFactorsTree([])
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
      const isParentFactors = (factor.parent_factors?.length ?? 0) > 0
      if (factor.parent || (!factor.parent && !isParentFactors)) {
        newCheckedIds.add(`${factor.id}`)
      }
      if (isParentFactors) {
        factor.parent_factors?.forEach((parentFactor) => {
          const parentFactorId = `${parentFactor.id}`
          const parentData = modifiedDataForFactorsTree(factorsAndParentFactorsMap.get(parentFactorId))
          if (!factor.parent) {
            newCheckedIds.add(`${parentFactor.id}_${factor.id}`)
          }
          newExpandedKeys.add(parentFactorId)
          if (!updatedSelectedFactorsMap.has(parentFactorId)) {
            updatedSelectedFactorsMap.set(parentFactorId, parentData.data)
          }
        })
      } else {
        const modifiedFactorData = modifiedDataForFactorsTree(factor)
        newExpandedKeys.add(modifiedFactorData.data.id)
        updatedSelectedFactorsMap.set(modifiedFactorData.data.id, modifiedFactorData.data)
      }
    })
    setSelectedFactors(Array.from(updatedSelectedFactorsMap.values()))
    const checkedIds = Array.from(newCheckedIds)
    setCheckedFactorsForFactorsTree(checkedIds)
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
      setIsFactorsLoading(false)
      const sortedData = sortFactors(data)
      setFactors(sortedData)
      const factorsAndParentFactorsMap = new Map([...factorsMap, ...getAllFactorsAndParentFactors(data)])
      setFactorsMap(factorsAndParentFactorsMap)
    })
  }

  const handleFetchQuestions = (factorIds: string[], assessmentId: string | number | null) => {
    const selectedFactorIds = new Set<string>()
    factorIds.forEach((factorId) => {
      const id = factorId.split('_').pop()
      if (id) {
        selectedFactorIds.add(id)
      }
    })
    const selectedIds = Array.from(selectedFactorIds)
    if (assessmentId) {
      collectionAction({
        action: `${assessmentId}/factors/questions`,
        method: 'get',
        apiConfig: {
          filter: {
            factor_ids: selectedIds,
          },
        },
      }).then((data: Question[]) => {
        setQuestions(data)
      })
    }
  }

  const debouncedOnFactorSearch = useDebouncedCallback((searchTerm: string) => {
    if (searchTerm.trim().length >= 3) {
      handleFetchFactors(searchTerm)
      setIsFactorsLoading(true)
    }
  }, 500)

  const handleSearch = (searchTerm: string) => {
    if (searchTerm) {
      debouncedOnFactorSearch(searchTerm)
    }
  }

  const handleCheckForFactorsTree = ({ checked }: {checked: Key[], halfChecked: Key[]}) => {
    setCheckedFactorsForFactorsTree(checked as string[])
    handleFetchQuestions(checked as string[], selectedAssessmentId)
  }

  const handleFactorsExpand = (expandedKeys: string[]) => {
    setExpandedKeys(expandedKeys)
  }

  const handleFactorChange = (value: string) => {
    const selectedFactor = factorsMap.get(value)
    const newSelectedFactors = modifiedDataForFactorsTree(selectedFactor)
    form.setFieldValue('factors', null)
    const isParentFactors = (factorsMap.get(value)?.parent_factors?.length ?? 0) > 0
    const updatedSelectedFactorsMap = new Map(selectedFactors.map(factor => [factor.id, factor]))
    const newExpandedKeys = new Set(expandedKeysForFactorsTree)
    let newCheckedIdsSet = new Set(checkedFactorsForFactorsTree)
    if (selectedFactor?.parent) {
      newCheckedIdsSet = new Set([...checkedFactorsForFactorsTree, value, ...newSelectedFactors.subFactorsIds])
    } else if (!selectedFactor?.parent && !isParentFactors) {
      newCheckedIdsSet = new Set([...checkedFactorsForFactorsTree, value])
    }

    if (isParentFactors) {
      const parentFactors = factorsMap.get(value)?.parent_factors
      parentFactors?.forEach((parentFactor) => {
        const parentData = modifiedDataForFactorsTree(factorsMap.get(parentFactor.id))
        if (selectedFactor && !selectedFactor.parent) {
          newCheckedIdsSet.add(`${parentFactor.id}_${selectedFactor.id}`)
        }
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
    const newCheckedIds = Array.from(newCheckedIdsSet)
    setCheckedFactorsForFactorsTree(newCheckedIds)
    handleFetchQuestions(newCheckedIds, selectedAssessmentId)
    setSelectedFactors(Array.from(updatedSelectedFactorsMap.values()))
  }

  const handleCampaignTemplateChange = (campaignTemplateId: number) => {
    const campaignTemplate = _.find(campaignTemplates,
      (campaignTemplate: CampaignTemplate) => campaignTemplate.id === campaignTemplateId)
    setSelectedTempalte(campaignTemplate)
    if (campaignTemplate && campaignTemplate.campaignId) {
      resetSettings()
      return
    }
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

  const handleTemplateSearch = (searchTerm: string) => {
    setTemplateSearchterm(searchTerm)
    if (searchTerm) {
      const filteredTemplates = campaignTemplates.filter((template: CampaignTemplate) => (
        template.name.trim().toLowerCase().includes(searchTerm.trim().toLowerCase())))
      setCampaignTemplatesData(filteredTemplates)
    } else {
      setCampaignTemplatesData(campaignTemplates)
    }
  }

  const handleFactorSelectAll = (checked, node: FactorForTree) => {
    let newCheckedIds = checkedFactorsForFactorsTree.filter(
      factorId => node.id !== factorId && !node.children.map(child => child.id).includes(factorId),
    )
    if (checked) {
      newCheckedIds = [...checkedFactorsForFactorsTree, node.id, ...node.children.map(child => child.id)]
    }
    setCheckedFactorsForFactorsTree(newCheckedIds)
    handleFetchQuestions(newCheckedIds, selectedAssessmentId)
  }

  const emptyRHS = (
    <Flex vertical gap={16} justify="center" align="center">
      <Flex vertical style={{ width: '200px', height: '200px' }} justify="center" align="center">
        <CampaignCreatorSVG />
      </Flex>
      <Flex vertical style={{ maxWidth: '600px' }} justify="center" align="center">
        <Typography.Title level={2} style={{ margin: 0 }}>
          {I18n.t(
            'admin.threesixity_instructions_customization_title',
          )}
        </Typography.Title>
        <Typography.Title level={5} style={{ margin: 0 }}>
          {I18n.t(
            'admin.threesixity_instructions_customization_sub_title',
          )}
        </Typography.Title>
      </Flex>
    </Flex>
  )

  const factorsSelectDropdownEmptyState = (
    <>
      {isFactorsLoading ? (
        <Flex
          vertical
          className="w-100 p-4"
          justify="center"
          align="center"
        >
          <LoadingOutlined style={{ fontSize: 24 }} />

        </Flex>
      ) : null}
      {factors === null && !isFactorsLoading ? (
        <Flex
          vertical
          className="w-100 p-4"
          justify="center"
          align="center"
        >
          <SearchOutlined style={{ fontSize: 24 }} />
          <Typography.Title level={5} style={{ margin: 0 }}>
            {I18n.t('admin.threesixity_search_factors_title')}
          </Typography.Title>
          <Typography.Paragraph style={{ margin: 0, textAlign: 'center' }} type="secondary">
            {I18n.t('admin.threesixity_search_factors_description')}
          </Typography.Paragraph>
        </Flex>
      ) : null
      }
      {factors !== null && !isFactorsLoading ? (
        <Flex
          vertical
          className="w-100 p-4"
          justify="center"
          align="center"
        >
          <ContainerOutlined style={{ fontSize: 24 }} />
          <Typography.Title level={5} style={{ margin: 0 }}>
            {I18n.t('admin.threesixity_no_factors_title')}
          </Typography.Title>
          <Typography.Paragraph style={{ margin: 0, textAlign: 'center' }} type="secondary">
            {I18n.t('admin.threesixity_no_factors_description')}
          </Typography.Paragraph>
        </Flex>
      ) : null
      }
    </>
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
              label={I18n.t('admin.threesixity_advance_settings_campaign_template')}
              rules={[{ required: true }]}
            >
              <Select
                onChange={handleCampaignTemplateChange}
                showSearch={{ filterOption: false, onSearch: handleTemplateSearch }}
                options={(campaignTemplatesData || []).map(template => ({
                  value: template.id,
                  label: template.name,
                }))}
              />
            </Form.Item>
            {showFactorsSelect && (
              <Form.Item
                name="factors"
                label={I18n.t('admin.threesixity_advance_settings_factors')}
              >
                <Select
                  showSearch={{ filterOption: false, onSearch: handleSearch }}
                  suffixIcon={<SearchOutlined />}
                  notFoundContent={factorsSelectDropdownEmptyState}
                  onChange={handleFactorChange}
                  options={(factors || []).map(f => ({
                    value: f.id,
                    label: f.parent ? <b>{f.name}</b> : f.name,
                  }))}
                />
              </Form.Item>
            )}
            <Tree
              checkable
              onExpand={handleFactorsExpand}
              expandedKeys={expandedKeysForFactorsTree}
              onCheck={handleCheckForFactorsTree}
              titleRender={(node) => {
                const checked = !checkedFactorsForFactorsTree.find(factorId => factorId === node.id)
                return (node.children?.length > 0 ? (
                  <Space size="large" className={styles.treeNode}>
                    <span className={styles.treeLabel}>{node.title}</span>
                    <a className={styles.treelink} onClick={() => handleFactorSelectAll(checked, node)}>
                      {checked
                        ? I18n.t('admin.common_select_all')
                        : I18n.t('admin.common_unselect_all')}
                    </a>
                  </Space>
                ) : node.title)
              }}
              checkedKeys={checkedFactorsForFactorsTree}
              checkStrictly
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
          <Button key="back" onClick={onBack} disabled={isSubmitting}>
            {I18n.t('shared.back')}
          </Button>
          <Button key="cancel" onClick={onClose} disabled={isSubmitting}>
            {I18n.t('shared.cancel')}
          </Button>
          <Button
            key="submit"
            type="primary"
            htmlType="submit"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {I18n.t('shared.save')}
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
  return (a.name ?? '').localeCompare(b.name ?? '')
})


const modifiedDataForFactorsTree = (factor): {data: FactorForTree, subFactorsIds : string[] } => {
  const subFactorsIds: string[] = []
  const subFactors = factor?.sub_factors?.map((subFactor) => {
    const id = `${factor.id}_${subFactor.id}`
    subFactorsIds.push(id)
    return ({
      key: id,
      title: subFactor.name,
      id,
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
