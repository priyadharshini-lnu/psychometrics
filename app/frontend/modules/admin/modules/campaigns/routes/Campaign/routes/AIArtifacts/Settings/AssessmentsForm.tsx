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
import { getAvailableAssessments } from './assessmentSearchUtils'
import Utils from '~/modules/reports/utils/Utils'
import { Assessment } from '~/modules/admin/modules/client/core/assessments'
import './assessmentSelect.css'

const { I18n } = window

const optionLabelStyle = {
  whiteSpace: 'normal' as const,
  wordBreak: 'break-word' as const,
  overflow: 'visible' as const,
  padding: '4px 0',
}

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
  const [assessmentSearchStates, setAssessmentSearchStates] = useState<{ [key: string]: string }>({})

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
    const normalizedSearchValue = value?.trim() || ''
    const searchConfig = normalizedSearchValue ? {
      apiConfig: {
        include_meta: ['permissions'],
        filter: {
          filterable_fields: normalizedSearchValue,
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
        questions: ['type', 'name', 'props', 'deleted_at'],
      },
      filter: {
        type_in: ['TextEntry', 'MultipleChoice'],
      },
    },
  })

  useEffect(() => {
    if (questions && questions.length > 0) {
      const activeQuestions = questions.filter(
        question => question.deletedAt === null || question.deletedAt === undefined,
      )
      const existingAssessment = transformQuestionsToAssessments(activeQuestions)
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
    const normalizedSearchValue = searchValue?.trim() || ''
    fetchQuestions({
      apiConfig: {
        filter: {
          assessment_id_eq: selectedAssessment,
          type_in: ['TextEntry', 'MultipleChoice'],
          deleted_at_null: 'true',
          filterable_fields: normalizedSearchValue,
        },
        fields: {
          questions: ['type', 'name', 'props', 'deleted_at'],
        },
        page: { size: 20 },
      },
    }).then(({ data }) => {
      if (!normalizedSearchValue) {
        const activeQuestionIds = new Set(data.map(question => question.id.toString()))
        const selectedQuestionIds = form.getFieldValue(['assessments', selectedAssessment, 'questions']) || []
        const filteredSelectedQuestionIds = selectedQuestionIds.filter(
          questionId => activeQuestionIds.has(questionId.toString()),
        )

        if (filteredSelectedQuestionIds.length !== selectedQuestionIds.length) {
          form.setFieldValue(
            ['assessments', selectedAssessment, 'questions'],
            filteredSelectedQuestionIds,
          )
        }
      }

      setAssessmentsAndQuestionsOptionsMap((prev) => {
        const assessment = prev[selectedAssessment] || { id: selectedAssessment, name: '', questions: [] }
        return {
          ...prev,
          [selectedAssessment]: {
            ...assessment,
            questions: uniqBy(data, 'id'),
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
    setAssessmentSearchStates((prev) => {
      const updated = { ...prev }
      delete updated[assessmentId]
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

    setAssessmentSearchStates((prev) => {
      const updated = { ...prev }
      delete updated[prevAssessmentId]
      updated[newAssessmentId] = ''
      return updated
    })
    searchAssessments('')

    searchQuestions(newAssessmentId)
  }

  const debouncedAssessmentSearch = useCallback(
    debounce((searchValue: string, currentAssessmentId: string) => {
      setAssessmentSearchStates(prev => ({ ...prev, [currentAssessmentId]: searchValue }))
      searchAssessments(searchValue)
    }, 300),
    [fetchAllAssessments],
  )

  const handleAssessmentSearch = (searchValue: string, currentAssessmentId: string) => {
    debouncedAssessmentSearch(searchValue, currentAssessmentId)
  }

  return (
    <Card
      key={DEPENDENCY_LABELS.assessments}
      type="inner"
      className="mt-4"
      title={DEPENDENCY_LABELS.assessments}
      extra={(open || (!isLoading && (selectedAssessments.size === 0
          || allAssessments.length > selectedAssessments.size))) ? (
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
              destroyTooltipOnHide={false}
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
        const debouncedSearch = (searchValue: string) => {
          handleAssessmentSearch(searchValue, assessmentId)
        }

        const availableAssessments = getAvailableAssessments(
          allAssessments,
          selectedAssessments,
          assessmentId,
        )

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
                  showSearch={{
                    filterOption: false,
                  }}
                  searchValue={assessmentSearchStates[assessmentId] || ''}
                  onSearch={debouncedSearch}
                  onChange={value => handleAssessmentChange(item.id, value)}
                  onClear={() => handleAssessmentSearch('', assessmentId)}
                  style={{ width: '100%' }}
                  popupClassName="assessment-select-popup"
                  loading={isLoadingAllAssessments('fetch')}
                  notFoundContent={
                    isLoadingAllAssessments('fetch') ? (
                      <div style={{ textAlign: 'center', padding: '10px 0' }}>
                        <Spin size="small" />
                      </div>
                    ) : (
                      I18n.t('admin.no_assessments_found')
                    )
                  }
                  options={availableAssessments.map(assessment => ({
                    key: assessment.id,
                    label: (
                      <div style={optionLabelStyle}>
                        {assessment.name}
                      </div>
                    ),
                    value: assessment.id.toString(),
                    title: assessment.name,
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
                  popupClassName="assessment-select-popup"
                  disabled={!assessmentId}
                  filterOption={false}
                  onSearch={searchValue => searchQuestions(assessmentId, searchValue)}
                  options={uniqBy(
                    (assessmentsAndQuestionsOptionsMap[assessmentId]?.questions || []).map(
                      (q) => {
                        const questionText = Utils.stripHTML(
                          q.props?.questionText || q.questionText,
                        ) || ''

                        return {
                          label: (
                            <div style={optionLabelStyle}>
                              {`${q.name} ${questionText}`.trim()}
                            </div>
                          ),
                          value: q.id,
                          title: `${q.name} ${questionText}`.trim(),
                        }
                      },
                    ),
                    'value',
                  )}
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
