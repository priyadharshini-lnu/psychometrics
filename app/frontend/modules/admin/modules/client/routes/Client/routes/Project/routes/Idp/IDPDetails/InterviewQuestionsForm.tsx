import {
  FC, useCallback, useEffect, useState,
} from 'react'
import {
  Col, Row, Button, Flex, Card, Select, Space, Typography, Divider,
  message, Table, Switch,
} from 'antd'
import { InterviewQuestion } from 'modules/admin/modules/client/core/interviewQuestion'
import debounce from 'lodash/debounce'
import { useParams } from 'react-router-dom'
import type { DragEndEvent } from '@dnd-kit/core'
import {
  DndContext, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { DeleteOutlined, PlusOutlined, MenuOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import InputDuration from '~/components/InputDuration'
import {
  Idp, IdpTR, IdpTemplateInterviewQuestion,
} from '~/modules/admin/modules/client/core/idp'
import { useResources } from '~/hooks/useResources'

const { I18n } = window
const { Text } = Typography

type InterviewQuestionsFormProps = {
  idp: Idp,
  fetch: () => void,
}

export const InterviewQuestionsForm: FC<InterviewQuestionsFormProps> = ({ idp, fetch }) => {
  const { projectId } = useParams() as { projectId: string, id: string }

  const baseApiConfig = {
    basePath: `projects/${projectId}`,
    trackUrl: true,
    responseType: IdpTR,
    apiConfig: {
      fields: {
        skills: ['id', 'name', 'skill_type', 'project_id'],
      },
      include: ['skills', 'report'],
    },
  }

  const { memberAction, isLoading } = useResources<Idp>('idp_templates', baseApiConfig)


  const [interviewQuestions, setInterviewQuestions] = useState<IdpTemplateInterviewQuestion[]>(
    idp.interviewQuestions || [],
  )

  const { data, fetch: fetchInterviewQuestions } = useResources<InterviewQuestion>('interview_questions', {
    basePath: `projects/${projectId}/`,
    apiConfig: {
      filter: {
        project_id_eq: projectId,
      },
    },
  })

  const isUpdating = isLoading(`post/update_interview_questions@${idp.id}`)

  useEffect(() => {
    fetchInterviewQuestions()
  }, [])

  const save = () => {
    memberAction({
      id: idp.id,
      action: 'update_interview_questions',
      method: 'post',
      body: { interviewQuestions },
    }).then(() => {
      message.success(I18n.t('admin.idp_interview_questions_updated'))
      fetch()
    })
  }

  const [selectedQuestion, setSelectedQuestion] = useState<string | undefined>(undefined)

  const searchHandler = useCallback(
    debounce((query) => {
      fetchInterviewQuestions({ apiConfig: { filter: { project_id_eq: projectId, question_cont: query } } })
    }, 300),
    [],
  )

  const handleSelectChange = (value: string) => {
    setSelectedQuestion(value)
  }

  const handleAddQuestion = () => {
    if (selectedQuestion) {
      const rq = data.find((item: InterviewQuestion) => item.id === selectedQuestion)
      if (!rq) return

      setInterviewQuestions([
        ...interviewQuestions,
        {
          id: rq.id,
          question: rq.question,
          mandatory: rq.mandatory,
          timeLimit: rq.timeLimit,
          questionType: rq.questionType,
        },
      ])
      setSelectedQuestion(undefined)
    }
  }

  const handleRemoveQuestion = (questionId: string) => {
    setInterviewQuestions(interviewQuestions.filter(item => item.id !== questionId))
  }

  const handleFieldChange = (questionId: string, field: string, value) => {
    setInterviewQuestions(
      prevQuestions => prevQuestions.map(q => (q.id === questionId ? { ...q, [field]: value } : q)),
    )
  }


  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 1,
      },
    }),
  )

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (active.id !== over?.id) {
      setInterviewQuestions((prev) => {
        const activeIndex = prev.findIndex(i => i.id === active.id)
        const overIndex = prev.findIndex(i => i.id === over?.id)
        return arrayMove(prev, activeIndex, overIndex)
      })
    }
  }

  return (
    <Row gutter={[16, 16]}>
      <Col span={16}>
        <Card title={I18n.t('admin.idp_interview_questions')}>
          <Space orientation="vertical" style={{ width: '100%' }}>
            <Flex gap={16}>
              <Select
                style={{ width: '100%' }}
                placeholder={I18n.t('admin.idp_select_reflection_question')}
                showSearch={{
                  filterOption: false,
                  onSearch: (query) => {
                    searchHandler(query)
                  },
                }}
                value={selectedQuestion}
                onChange={handleSelectChange}
              >
                {data.filter(({ id }) => !interviewQuestions.find(r => r.id === id)).map(question => (
                  <Select.Option key={question.id} value={question.id}>
                    {question.question}
                  </Select.Option>
                ))}
              </Select>
              <Button
                type="primary"
                onClick={handleAddQuestion}
                disabled={!selectedQuestion}
                icon={<PlusOutlined />}
              >
                {I18n.t('common.actions.add')}
              </Button>
            </Flex>

            <Divider />

            {interviewQuestions.length > 0 ? (
              <DndContext sensors={sensors} modifiers={[]} onDragEnd={onDragEnd}>
                <SortableContext
                  // rowKey array
                  items={interviewQuestions.map(i => i.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <Table
                    dataSource={interviewQuestions}
                    rowKey="id"
                    pagination={false}
                    bordered
                    components={{
                      body: { row: TableRow },
                    }}
                    columns={[
                      {
                        dataIndex: 'handler',
                        key: 'handler',
                        width: 50,
                        render: () => (
                          <Button
                            type="text"
                            icon={<MenuOutlined />}
                            style={{ cursor: 'move' }}
                          />
                        ),
                      },
                      {
                        title: I18n.t('admin.interview_questions_form_question'),
                        dataIndex: 'question',
                        key: 'question',
                      },
                      {
                        title: I18n.t('admin.interview_questions_form_question_type'),
                        dataIndex: 'questionType',
                        key: 'questionType',
                        width: 120,
                      },
                      {
                        title: I18n.t('admin.interview_questions_form_mandatory'),
                        dataIndex: 'mandatory',
                        key: 'mandatory',
                        width: 120,
                        render: (_, record) => (
                          <Switch
                            checked={record.mandatory}
                            onChange={checked => handleFieldChange(record.id, 'mandatory', checked)}
                          />
                        ),
                      },
                      {
                        title: I18n.t('admin.interview_questions_form_time_limit'),
                        dataIndex: 'timeLimit',
                        key: 'timeLimit',
                        width: 120,
                        render: (_, record) => (
                          <InputDuration
                            value={record.timeLimit?.toString()}
                            onChange={value => handleFieldChange(record.id, 'timeLimit', value)}
                            style={{ width: '100%' }}
                          />
                        ),
                      },
                      {
                        title: '',
                        key: 'action',
                        width: 80,
                        render: (_, record) => (
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleRemoveQuestion(record.id)}
                          />
                        ),
                      },
                    ]}
                  />
                </SortableContext>
              </DndContext>
            ) : (
              <Text type="secondary">{I18n.t('admin.idp_no_interview_questions_selected')}</Text>
            )}
          </Space>
          <Flex justify="flex-end" className="mt-6">
            <Button onClick={save} type="primary" loading={isUpdating}>
              {I18n.t('admin.idp_update_interview_questions')}
            </Button>
          </Flex>
        </Card>
      </Col>
    </Row>
  )
}

interface RowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  'data-row-key': string;
}

const TableRow: React.FC<Readonly<RowProps>> = (props) => {
  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging,
  } = useSortable({
    // eslint-disable-next-line react/destructuring-assignment
    id: props['data-row-key'],
  })

  const style: React.CSSProperties = {
    // eslint-disable-next-line react/destructuring-assignment
    ...props.style,
    transform: CSS.Translate.toString(transform),
    transition,
    cursor: 'move',
    ...(isDragging ? { position: 'relative', zIndex: 9999 } : {}),
  }

  return <tr {...props} ref={setNodeRef} style={style} {...attributes} {...listeners} />
}

export default InterviewQuestionsForm
