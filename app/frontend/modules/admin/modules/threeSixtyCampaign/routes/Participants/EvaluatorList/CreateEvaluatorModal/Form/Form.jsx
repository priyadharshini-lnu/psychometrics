import { useEffect, useState } from 'react'
import { Form as AntForm, Select, Button } from 'antd'
import _ from 'lodash'
import { useParams } from 'react-router-dom'
import userPresenter from '~/presenters/user'
import UserAutocomplete from '~/components/UserAutocomplete'

const formItemLayout = { labelCol: { span: 5 }, wrapperCol: { span: 12 } }

export default function Form ({
  autocompletedSubjects,
  autocompletedEvaluators,
  fetchRelationships,
  relationships,
  onSubmit,
}) {
  const { campaignId, projectId } = useParams()
  const [evaluator, setEvaluator] = useState({})
  const [autocompletedSubject, setAutocompletedSubject] = useState('')
  const [autocompletedEvaluator, setAutocompletedEvaluator] = useState('')

  useEffect(() => {
    fetchRelationships(campaignId)
  }, [])

  useEffect(() => {
    setEvaluator({ relationship: relationships[0] })
  }, [relationships])

  const onSelect = (field, user) => {
    const data = JSON.parse(user)
    setEvaluator({ ...evaluator, [field]: JSON.parse(user) })
    if (field === 'subject') {
      setAutocompletedSubject(userPresenter.getFullNameWithEmail(data))
    } else {
      setAutocompletedEvaluator(userPresenter.getFullNameWithEmail(data))
    }
  }

  const onClick = () => {
    setEvaluator({ relationship: evaluator.relationship })
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
          url={`/administration/projects/${projectId}/search_users`}
          source="evaluators"
          placeholder="Search Evaluator..."
        />
      </AntForm.Item>
      <AntForm.Item label="Relationship">
        <Select
          value={evaluator.relationship && evaluator.relationship.id}
          onChange={id => setEvaluator({ ...evaluator, relationship: _.find(relationships, { id }) })}
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
