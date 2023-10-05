import _ from 'lodash'
import {
  Select, Button, Form, Modal,
} from 'antd'
import QuestionPresenter from '~/modules/survey/presenters/question'
import styles from './ResourceManager.less'

const { I18n } = window
export default function Resource ({
  resource, index, assessments, changeResource, assessmentQuestions,
  removeResource,
}) {
  const assessmentOptions = assessments.map(({ id, name }) => ({ id, label: name }))
  const questionOptions = assessmentQuestions[resource.assessmentId]
    && assessmentQuestions[resource.assessmentId].map(({ id, name, props }) => ({
      id, label: QuestionPresenter.getName({ name, props }, 150),
    }))

  const remove = () => {
    Modal.confirm({
      title: I18n.t('administration.resource.remove_confirm.title'),
      content: I18n.t('administration.resource.remove_confirm.message'),
      okText: I18n.t('common.text.confirm'),
      cancelText: I18n.t('common.text.cancel'),
      onOk: () => {
        removeResource(index)
      },
    })
  }

  return (
    <div className={styles.container}>
      <div className={styles.row}>
        <Form style={{ width: '100%' }}>
          <Form.Item
            label="Assessment"
            labelCol={{ span: 3 }}
          >
            <Select
              showSearch
              labelInValue
              value={_.find(assessmentOptions, { id: +resource.assessmentId })}
              onChange={({ value }) => changeResource(index, { assessmentId: value, questionId: null })}
              placeholder="Select an assessment"
              defaultValue={_.find(assessmentOptions, { id: resource.assessmentId })}
              filterOption={(input, option: {children: string}) => option.children.toLowerCase()
                .indexOf(input.toLowerCase()) >= 0}
            >
              {assessmentOptions.map(({ id, label }) => (
                <Select.Option key={id} value={id}>{label}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          {questionOptions && (
            <Form.Item
              label="Question"
              labelCol={{ span: 3 }}
              style={{ marginBottom: 0 }}
            >
              <Select
                showSearch
                labelInValue
                value={_.find(questionOptions, { id: resource.questionId })}
                onChange={({ value }) => changeResource(index, { ...resource, questionId: value })}
                placeholder="Select a question"
                filterOption={(input, option: {children: string}) => option.children.toLowerCase()
                  .indexOf(input.toLowerCase()) >= 0}
              >
                {questionOptions.map(({ id, label }) => (
                  <Select.Option key={id} value={id}>
                    {label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          )}
        </Form>
      </div>
      <Button type="primary" danger onClick={remove}>Remove</Button>
    </div>
  )
}
