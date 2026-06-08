import { useEffect, useState, useCallback } from 'react'
import {
  Button, Select, Form, FormInstance,
  Row,
  Col,
  Card, Popover, Spin, Flex, Typography,
} from 'antd'
import {
  uniqBy, debounce,
} from 'lodash'
import { useParams } from 'react-router-dom'
import { DeleteOutlined, PlusOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { useResources } from '~/hooks/useResources'
import { DEPENDENCY_LABELS } from './constants'
import { Question } from './types'
import { AddAssessmentForm } from './AddAssessmentForm'
import {
  transformQuestionsToAssessments,
} from './helpers'
import Utils from '~/modules/reports/utils/Utils'
import { Assessment } from '~/modules/admin/modules/client/core/assessments'

const { I18n } = window

type Props = {
  questions?: Question[]
  form: FormInstance
}

export const AssessmentsForm: React.FC<Props> = ({ questions, form }: Props) => {
  const { campaignId } = useParams() as { campaignId: string }
  const [isLoading, setIsLoading] = useState(true)
  const [assessmentsAndQuestionsMap, setAssessmentsAndQuestionsMap] = useState({})
  const [assessmentsAndQuestionsOptionsMap, setAssessmentsAndQuestionsOptionsMap] = useState({})
  const [selectedAssessments, setSelectedAssessments] = useState<Set<string>>(new Set())

  const [open, setOpen] = useState(false)

  const {
    data: allAssessments, fetch: fetchAllAssessments, isLoading: isLoadingAllAssessments,
  } = useResources<Assessment>(
    'all_assessments',
    {
      basePath: `campaigns/${campaignId}`,
    },
  )

  useEffect(() => {
    fetchAllAssessments({ apiConfig: { include_meta: ['permissions'] } }).then(() => {
      setIsLoading(false)
    })
  }, [campaignId])

  const searchAssessments = (value: string) => {
    const searchConfig = value ? {
      apiConfig: {
        include_meta: ['permissions'],
        filter: {
          filterable_fields: value,
        },
      },
    } : {
      apiConfig: { include_meta: ['permissions'] },
    }

    fetchAllAssessments(searchConfig)
  }

  const debouncedSearchAssessments = useCallback(
    debounce((value: string) => searchAssessments(value), 300),
    [fetchAllAssessments],
  )

  const handleAssessmentSelect = (value: string) => {
    setOpen(false)
    setSelectedAssessments(prev => prev.add(value))
    setAssessmentsAndQuestionsOptionsMap((prev) => {
      const selectedAssessment = allAssessments.find(a => a.id.toString() === value)
      return {
        ...prev,
        [value]: {
          id: value,
          name: selectedAssessment?.name || '',
          questions: [],
        },
      }
    })
    setAssessmentsAndQuestionsMap((prev) => {
      const selectedAssessment = allAssessments.find(a => a.id.toString() === value)
      return {
        [value]: {
          id: value,
          name: selectedAssessment?.name || '',
          questions: [],
        },
        ...prev,
      }
    })

    // Automatically fetch questions for the newly selected assessment
    searchQuestions(value)
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
  }

  const {
    fetch: fetchQuestions,
  } = useResources('questions', {
    apiConfig: {
      fields: {
        questions: ['type', 'name', 'props'],
      },
      filter: {
        type_in: ['TextEntry', 'MultipleChoice'],
      },
    },
  })

  useEffect(() => {
    if (questions && questions.length > 0) {
      const existingAssessment = transformQuestionsToAssessments(questions)
      setSelectedAssessments(new Set(Object.keys(existingAssessment)))
      setAssessmentsAndQuestionsOptionsMap(existingAssessment)
      setAssessmentsAndQuestionsMap(existingAssessment)

      // Fetch all questions for each assessment to populate the dropdown
      Object.keys(existingAssessment).forEach((assessmentId) => {
        searchQuestions(assessmentId)
      })
    } else {
      setSelectedAssessments(new Set())
      setAssessmentsAndQuestionsOptionsMap({})
      setAssessmentsAndQuestionsMap({})
      form.setFieldValue('assessments', {})
    }
  }, [questions])

  const searchQuestions = (selectedAssessment: string, searchValue?: string) => {
    fetchQuestions({
      apiConfig: {
        filter: {
          assessment_id_eq: selectedAssessment,
          type_in: ['TextEntry', 'MultipleChoice'],
          filterable_fields: searchValue ? `%${searchValue}%` : '',
        },
        fields: {
          questions: ['type', 'name'],
        },
        page: { size: 20 },
      },
    }).then(({ data }) => {
      setAssessmentsAndQuestionsOptionsMap((prev) => {
        const assessment = prev[selectedAssessment] || { id: selectedAssessment, name: '', questions: [] }
        const existingQuestions = assessment.questions || []
        const uniqueQuestions = uniqBy([...existingQuestions, ...data], 'id')
        return {
          ...prev,
          [selectedAssessment]: {
            ...assessment,
            questions: uniqueQuestions,
          },
        }
      })
    })
  }

  const handleRemove = (assessmentId: string) => {
    form.setFieldValue(['assessments', assessmentId], undefined)

    setAssessmentsAndQuestionsOptionsMap((prev) => {
      const updated = { ...prev }
      delete updated[assessmentId]
      return updated
    })
    setAssessmentsAndQuestionsMap((prev) => {
      const updated = { ...prev }
      delete updated[assessmentId]
      return updated
    })
    setSelectedAssessments((prev) => {
      const updated = new Set(prev)
      updated.delete(assessmentId)
      return updated
    })
  }

  const handleAssessmentChange = (prevAssessmentId: string, newAssessmentId: string) => {
    if (prevAssessmentId === newAssessmentId) return

    setAssessmentsAndQuestionsMap((prev) => {
      const updated = { ...prev }
      delete updated[prevAssessmentId]
      updated[newAssessmentId] = {
        id: newAssessmentId,
        name: allAssessments.find(a => a.id.toString() === newAssessmentId)?.name,
        questions: [],
      }
      return updated
    })

    // Initialize the new assessment in the options map if it doesn't exist
    setAssessmentsAndQuestionsOptionsMap((prev) => {
      const updated = { ...prev }
      delete updated[prevAssessmentId]
      if (!updated[newAssessmentId]) {
        updated[newAssessmentId] = {
          id: newAssessmentId,
          name: allAssessments.find(a => a.id.toString() === newAssessmentId)?.name || '',
          questions: [],
        }
      }
      return updated
    })

    setSelectedAssessments((prev) => {
      const updated = new Set(prev)
      updated.delete(prevAssessmentId)
      updated.add(newAssessmentId)
      return updated
    })

    searchQuestions(newAssessmentId)
  }


  return (
    <Card
      key={DEPENDENCY_LABELS.assessments}
      type="inner"
      className="mt-4"
      title={DEPENDENCY_LABELS.assessments}
      extra={(!isLoading && (selectedAssessments.size === 0
          || allAssessments.length > selectedAssessments.size)) ? (
            <Popover
              style={{ width: '400px' }}
              content={(
                <AddAssessmentForm
                  allAssessments={allAssessments || []}
                  selectedAssessments={selectedAssessments}
                  onAssessmentSelect={handleAssessmentSelect}
                  onSearch={debouncedSearchAssessments}
                  isLoading={isLoadingAllAssessments('fetch')}
                />
          )}
              title={I18n.t('admin.form_add_assessment')}
              placement="bottomRight"
              trigger="click"
              open={open}
              onOpenChange={handleOpenChange}
            >
              <Button
                type="primary"
                icon={<PlusOutlined />}
              >
                {I18n.t('shared.add')}
              </Button>
            </Popover>
        ) : null}
    >
      {isLoading ? <Flex justify="center"><Spin /></Flex> : null}
      {!isLoading && selectedAssessments.size > 0 ? Array.from(selectedAssessments).reverse().map((
        assessmentId: string,
      ) => {
        const item = assessmentsAndQuestionsMap[assessmentId]
        return (
          <Row key={item.id} gutter={16} style={{ marginBottom: 16 }}>
            <Col span={22}>
              <Form.Item
                name={['assessments', item.id, 'assessment']}
                label="Assessment"
                rules={[
                  {
                    required: true,
                    message: I18n.t('admin.form_assessment_required'),
                  },
                ]}
                style={{ marginBottom: 16 }}
                initialValue={assessmentId}
              >
                <Select
                  placeholder={I18n.t('admin.form_select_assessment')}
                  allowClear
                  showSearch
                  onChange={value => handleAssessmentChange(item.id, value)}
                  filterOption={(input, option) => {
                    const label = String(option?.label || '')
                    return label.toLowerCase().includes(input.toLowerCase())
                  }}
                  optionFilterProp="label"
                  style={{ width: '100%' }}
                  options={(allAssessments || [])
                    .filter(assessment => !selectedAssessments.has(assessment.id.toString())
                              || assessment.id.toString() === item.id)
                    .map(assessment => ({
                      key: assessment.id,
                      label: assessment.name,
                      value: assessment.id.toString(),
                    }))}
                />
              </Form.Item>
              <Form.Item
                name={['assessments', item.id, 'questions']}
                label="Questions"
                rules={[
                  {
                    required: true,
                    message: I18n.t('admin.form_questions_required'),
                  },
                ]}
                style={{ marginBottom: 0 }}
                initialValue={item.questions?.map(q => q.id) || []}
              >
                <Select
                  mode="multiple"
                  placeholder={I18n.t('admin.form_select_questions')}
                  allowClear
                  showSearch
                  style={{ width: '100%' }}
                  disabled={!assessmentId}
                  optionFilterProp="label"
                  onSearch={searchValue => searchQuestions(assessmentId, searchValue)}
                  options={uniqBy((assessmentsAndQuestionsOptionsMap[assessmentId]?.questions || []).map(q => ({
                    label: `${q.name} ${(Utils.stripHTML(q.props?.questionText || q.questionText) || '')
                      .substring(0, 24)}...`,
                    value: q.id,
                  })), 'value')}
                />
              </Form.Item>
            </Col>
            <Col span={2} style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
              <Button
                type="text"
                onClick={() => handleRemove(item.id)}
                icon={<DeleteOutlined />}
                danger
                size="small"
                style={{ marginTop: 32 }}
              />
            </Col>
          </Row>
        )
      }) : null}
      {!isLoading && selectedAssessments.size === 0 ? (
        <Flex justify="center">
          <Typography.Text>
            {I18n.t('admin.form_no_assessment_selected')}
          </Typography.Text>
        </Flex>
      ) : null}
    </Card>
  )
}
