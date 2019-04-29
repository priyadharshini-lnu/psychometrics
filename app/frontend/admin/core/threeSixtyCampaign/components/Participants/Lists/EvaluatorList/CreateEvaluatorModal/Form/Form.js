import React, { useEffect, useState } from 'react'
import { Form as AntForm, Select, Button } from 'antd'
import _ from 'lodash'
import UserAutocomplete from '../../../shared/UserAutocomplete'

const formItemLayout = { labelCol: { span: 5 }, wrapperCol: { span: 12 } }

export default function Form ({
  autocompletedSubjects,
  autocompletedEvaluators,
  fetchRelationships,
  relationships,
  onSubmit,
  match: {
    params: { projectId, clientId, campaignId },
  },
}) {
  const [evaluator, setEvaluator] = useState({})
  const [autocompletedSubject, setAutocompletedSubject] = useState('')
  const [autocompletedEvaluator, setAutocompletedEvaluator] = useState('')

  useEffect(() => {
    fetchRelationships(campaignId)
  }, [])

  useEffect(() => {
    setEvaluator({ relationshipName: relationships[0] })
  }, [relationships])

  const onSelect = (field, user) => setEvaluator({ ...evaluator, [field]: JSON.parse(user) })

  const onClick = () => {
    setEvaluator({ relationshipName: evaluator.relationship })
    setAutocompletedSubject('')
    setAutocompletedEvaluator('')
    onSubmit(evaluator)
  }

  return (
    <AntForm {...formItemLayout}>
      <AntForm.Item label="Subject">
        <UserAutocomplete
          value={autocompletedSubject}
          onChange={setAutocompletedSubject}
          onSelect={user => onSelect('subject', user)}
          users={autocompletedSubjects}
          url={`/administration/threesixty_campaigns/${campaignId}/subjects/search`}
          source="subjects"
          placeholder="Search Subject..."
        />
      </AntForm.Item>
      <AntForm.Item label="Evaluator">
        <UserAutocomplete
          value={autocompletedEvaluator}
          onChange={setAutocompletedEvaluator}
          users={autocompletedEvaluators}
          onSelect={user => onSelect('evaluator', user)}
          url={`/administration/clients/${clientId}/projects/${projectId}/search_users`}
          source="evaluators"
          placeholder="Search Evaluator..."
        />
      </AntForm.Item>
      <AntForm.Item label="Relationship">
        <Select
          value={evaluator.relationship && evaluator.relationship.id}
          onChange={id => setEvaluator({ ...evaluator, relationshipName: _.find(relationships, { id }) })}
        >
          {relationships.map(r => (
            <Select.Option key={r.id} value={r.id}>
              {r.name}
            </Select.Option>
          ))}
        </Select>
      </AntForm.Item>
      <AntForm.Item wrapperCol={{ span: 12, offset: 5 }}>
        <Button type="primary" onClick={onClick}>
          Add
        </Button>
      </AntForm.Item>
    </AntForm>
  )
}
