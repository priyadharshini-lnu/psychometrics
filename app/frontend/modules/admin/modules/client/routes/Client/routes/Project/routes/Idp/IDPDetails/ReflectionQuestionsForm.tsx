import {
  FC, useCallback, useEffect, useState,
} from 'react'
import {
  Col, Row, Button, Flex, Card, Select, Space, Typography, Divider,
  message, Table, InputNumber, Switch,
} from 'antd'
import { ReflectionQuestion } from 'modules/admin/modules/client/core/reflectionQuestion'
import debounce from 'lodash/debounce'
import { useParams } from 'react-router-dom'
import { DeleteOutlined, PlusOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { useResources } from '~/hooks/useResources'
import {
  Idp, IdpTR, IdpTemplateReflectionQuestion,
} from '~/modules/admin/modules/client/core/idp'

const { I18n } = window
const { Text } = Typography

type ReflectionQuestionsFormProps = {
  idp: Idp,
  fetch: () => void,
}

export const ReflectionQuestionsForm: FC<ReflectionQuestionsFormProps> = ({ idp, fetch }) => {
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


  const [reflectionQuestions, setReflectionQuestions] = useState<IdpTemplateReflectionQuestion[]>(
    idp.reflectionQuestions || [],
  )

  const { data, fetch: fetchReflectionQuestions } = useResources<ReflectionQuestion>('reflection_questions', {
    basePath: `projects/${projectId}/`,
    apiConfig: {
      filter: {
        project_id_eq: projectId,
      },
    },
  })

  const isUpdating = isLoading(`post/update_reflection_questions@${idp.id}`)

  useEffect(() => {
    fetchReflectionQuestions()
  }, [])

  const save = () => {
    memberAction({
      id: idp.id,
      action: 'update_reflection_questions',
      method: 'post',
      body: { reflectionQuestions },
    }).then(() => {
      message.success(I18n.t('admin.idp_reflection_questions_updated'))
      fetch()
    })
  }

  const [selectedQuestion, setSelectedQuestion] = useState<string | undefined>(undefined)

  const searchHandler = useCallback(
    debounce((query) => {
      fetchReflectionQuestions({ apiConfig: { filter: { project_id_eq: projectId, question_cont: query } } })
    }, 300),
    [],
  )

  const handleSelectChange = (value: string) => {
    setSelectedQuestion(value)
  }

  const handleAddQuestion = () => {
    if (selectedQuestion) {
      const rq = data.find((item: ReflectionQuestion) => item.id === selectedQuestion)
      if (!rq) return

      setReflectionQuestions([
        ...reflectionQuestions,
        {
          id: rq.id,
          question: rq.question,
          mandatory: rq.mandatory,
          minWords: rq.minWords,
          maxWords: rq.maxWords,
        },
      ])
      setSelectedQuestion(undefined)
    }
  }

  const handleRemoveQuestion = (questionId: string) => {
    setReflectionQuestions(reflectionQuestions.filter(item => item.id !== questionId))
  }

  const handleFieldChange = (questionId: string, field: string, value) => {
    setReflectionQuestions(
      prevQuestions => prevQuestions.map(q => (q.id === questionId ? { ...q, [field]: value } : q)),
    )
  }

  return (
    <Row gutter={[16, 16]}>
      <Col span={16}>
        <Card title={I18n.t('admin.idp_reflection_questions')}>
          <Space orientation="vertical" style={{ width: '100%' }}>
            <Flex gap={16}>
              <Select
                style={{
                  width: '100%', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap',
                }}
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
                {data.filter(({ id }) => !reflectionQuestions.find(r => r.id === id)).map(question => (
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

            {reflectionQuestions.length > 0 ? (
              <Table
                dataSource={reflectionQuestions}
                rowKey="id"
                pagination={false}
                bordered
                columns={[
                  {
                    title: I18n.t('admin.reflection_questions_form_question'),
                    dataIndex: 'question',
                    key: 'question',
                  },
                  {
                    title: I18n.t('admin.reflection_questions_form_mandatory'),
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
                    title: I18n.t('admin.reflection_questions_form_min_words'),
                    dataIndex: 'minWords',
                    key: 'minWords',
                    width: 120,
                    render: (_, record) => (
                      <InputNumber
                        min={0}
                        value={record.minWords}
                        onChange={value => handleFieldChange(record.id, 'minWords', value)}
                        style={{ width: '100%' }}
                      />
                    ),
                  },
                  {
                    title: I18n.t('admin.reflection_questions_form_max_words'),
                    dataIndex: 'maxWords',
                    key: 'maxWords',
                    width: 120,
                    render: (_, record) => (
                      <InputNumber
                        min={0}
                        value={record.maxWords}
                        onChange={value => handleFieldChange(record.id, 'maxWords', value)}
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
            ) : (
              <Text type="secondary">{I18n.t('admin.idp_no_reflection_questions_selected')}</Text>
            )}
          </Space>
          <Flex justify="flex-end" className="mt-6">
            <Button onClick={save} type="primary" loading={isUpdating}>
              {I18n.t('admin.idp_update_reflection_questions')}
            </Button>
          </Flex>
        </Card>
      </Col>
    </Row>
  )
}

export default ReflectionQuestionsForm
