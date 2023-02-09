import _ from 'lodash'
import {
  Select, Row, Col, Button, Form,
} from 'antd'
import QuestionPresenter from '~/modules/survey/presenters/question'
import styles from './ResourceManager.less'

export default function Resource ({
  resource, index, assessments, changeResource, assessmentQuestions,
  removeResource,
}) {
  const assessmentOptions = assessments.map(({ id, name }) => ({ id, label: name }))
  const questionOptions = assessmentQuestions[resource.assessmentId]
    && assessmentQuestions[resource.assessmentId].map(({ id, props }) => ({
      id, label: QuestionPresenter.getName({ name, props }, 150),
    }))

  const remove = () => {
    // eslint-disable-next-line no-alert
    if (confirm('Are you sure?')) {
      removeResource(index)
    }
  }

  return (
    <Row className={styles.row}>
      <Col flex={1} className={styles.resource}>
        <Form>
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
              filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
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
                filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
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
      </Col>
      <Col style={{ width: 80 }}>
        <Button type="danger" onClick={remove}>Remove</Button>
      </Col>
      <hr />
    </Row>
  )
}
