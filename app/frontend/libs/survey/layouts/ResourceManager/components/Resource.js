import React from 'react'
import { Select, Row, Col } from 'antd'
import Utils from 'libs/survey/utils'
import styles from './ResourceManager.scss'

export default function Resource ({
  resource, index, assessments, changeResource, assessmentQuestions,
}) {
  const assessmentOptions = assessments.map(({ id, name }) => ({ id, label: name }))
  const questionOptions = assessmentQuestions[resource.assessmentId]
    && assessmentQuestions[resource.assessmentId].map(({ id, props }) => ({
      id, label: Utils.stripHTML(props.questionText || 'default text').substr(0, 200),
    }))

  return (
    <Row className={styles.row}>
      <Col flex={1} className={styles.resource}>
        <div>
          Assessment:
          <Select
            style={{ width: '100%' }}
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
        </div>
        {questionOptions && (
          <div>
            Question:
            <Select
              style={{ width: '100%' }}
              showSearch
              labelInValue
              value={_.find(questionOptions, { id: resource.questionId })}
              onChange={({ value }) => changeResource(index, { ...resource, questionId: value })}
              placeholder="Select a question"
              filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {questionOptions.map(({ id, label }) => (
                <Select.Option key={id} value={id}>
                  {label}
                </Select.Option>
              ))}
            </Select>
          </div>
        )}
      </Col>
    </Row>
  )
}
