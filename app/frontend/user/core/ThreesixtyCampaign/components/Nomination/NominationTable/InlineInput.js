import React, { useState } from 'react'
import {
  Input, Button, Form, AutoComplete,
} from 'antd'
import userPresenter from 'presenters/userPresenter'

export default function InlineInput ({
  title, role, addNomination, searchEvaluators, autocomplete: { users },
  match: { params: { campaignId, id: nominationId } },
}) {
  const [edit, setEdit] = useState(false)
  const [user, setUser] = useState(null)
  const [hasErrors, setHasErrors] = useState({ user: false })

  const handleAdd = () => {
    if (user) {
      addNomination({
        campaignId, nominationId, user, role,
      })
      setUser(null)
      setEdit(false)
    } else {
      const errors = { user: false, role: false }
      if (!user) { errors.user = true }
      if (!role) { errors.role = true }
      setHasErrors(errors)
    }
  }

  return (
    <div>
      {edit
        ? (
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
                <Input.Search style={{ width: 300 }} onSearch={value => searchEvaluators(campaignId, value)} />
              </AutoComplete>
            </Form.Item>
            <Form.Item>
              <Button type="primary" onClick={handleAdd}>Add</Button>
            </Form.Item>
          </Form>
        )
        : <a className="add-link" onClick={() => setEdit(!edit)}>{title}</a>}
    </div>
  )
}
