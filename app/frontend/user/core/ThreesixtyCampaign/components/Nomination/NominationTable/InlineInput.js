import React, { useState } from 'react'
import {
  Input, Button, Form, AutoComplete,
} from 'antd'
import userPresenter from 'presenters/userPresenter'

export default function InlineInput ({
  relationship, addNomination, searchEvaluators, hideForm,
  autocomplete: { users },
  match: { params: { campaignId, id: nominationId } },
}) {
  const [user, setUser] = useState(null)
  const [hasErrors, setHasErrors] = useState({ user: false })

  const handleAdd = () => {
    if (user) {
      addNomination({
        campaignId, nominationId, userId: user, relationshipId: relationship,
      })
      setUser(null)
      hideForm()
    } else {
      const errors = { user: false, relationship: false }
      if (!user) { errors.user = true }
      if (!relationship) { errors.relationship = true }
      setHasErrors(errors)
    }
  }

  return (
    <div>
      <Form layout="inline">
        <Form.Item
          validateStatus={hasErrors.user ? 'error' : ''}
          help={hasErrors.user ? 'User is required' : ''}
        >
          <AutoComplete
            dataSource={users.map(user => ({
              value: user.id,
              text: userPresenter.getFullNameWithEmail(user),
            }))}
            autoFocus
            placeholder="type name or email..."
            onSelect={userId => setUser(userId)}
          >
            <Input.Search
              style={{ width: 300 }}
              onSearch={value => searchEvaluators(campaignId, nominationId, value)}
            />
          </AutoComplete>
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={handleAdd}>Add</Button>
          <Button type="default" onClick={hideForm}>Cancel</Button>
        </Form.Item>
      </Form>
    </div>
  )
}
