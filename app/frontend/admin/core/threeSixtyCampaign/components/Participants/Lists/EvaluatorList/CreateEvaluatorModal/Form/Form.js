import React from 'react'
import { Form as AntForm, Select, Button } from 'antd'
import UserAutocomplete from '../../../shared/UserAutocomplete'

const formItemLayout = { labelCol: { span: 5 }, wrapperCol: { span: 12 } }


export default function Form ({
  autocompletedSubjects,
  autocompletedEvaluators,
  match: {
    params: { projectId, clientId },
  },
}) {
  return (
    <AntForm {...formItemLayout}>
      <AntForm.Item label="Subject">
        <UserAutocomplete
          users={autocompletedSubjects}
          url={`/administration/clients/${clientId}/projects/${projectId}/search_users`}
          source="subjects"
          placeholder="Search Subject..."
        />
      </AntForm.Item>
      <AntForm.Item label="Evaluator">
        <UserAutocomplete
          users={autocompletedEvaluators}
          url={`/administration/clients/${clientId}/projects/${projectId}/search_users`}
          source="evaluators"
          placeholder="Search Evaluator..."
        />
      </AntForm.Item>
      <AntForm.Item label="Relationship">
        <Select defaultValue="1">
          <Select.Option value="1">Option 1</Select.Option>
          <Select.Option value="2">Option 2</Select.Option>
          <Select.Option value="3">Option 3</Select.Option>
        </Select>
      </AntForm.Item>
      <AntForm.Item wrapperCol={{ span: 12, offset: 5 }}>
        <Button type="primary" onClick={() => console.log(1111)}>
          Add
        </Button>
      </AntForm.Item>
    </AntForm>
  )
}
