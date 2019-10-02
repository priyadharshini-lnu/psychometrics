import React, { useState } from 'react'
import {
  Input, Button, Form, AutoComplete,
} from 'antd'
import userPresenter from 'presenters/userPresenter'

export default function InlineInput ({
  relationship, addNomination, searchEvaluators, hideForm,
  autocomplete: { users },
  match: { params: { campaignId, id: nominationId } },
  setShowPrompt, setParticipant,
}) {
  const [email, setEmail] = useState(null)
  const [hasErrors, setHasErrors] = useState({ email: false })

  const handleAdd = () => {
    if (email) {
      addNomination({
        campaignId, nominationId, email, relationshipId: relationship,
      }).catch((error) => {
        if (!error.evaluatorEmail && !error.relationshipId && (error.firstName || error.lastName)) {
          setParticipant({
            campaignId, nominationId, email, relationshipId: relationship,
          })
          setShowPrompt(true)
        }
      }).then(() => {
        setEmail(null)
        hideForm()
      })
    } else {
      const errors = { email: false, relationship: false }
      if (!email) { errors.email = true }
      if (!relationship) { errors.relationship = true }
      setHasErrors(errors)
    }
  }

  return (
    <div>
      <Form layout="inline">
        <Form.Item
          validateStatus={hasErrors.user ? 'error' : ''}
          help={hasErrors.email ? 'Email is required' : ''}
        >
          <AutoComplete
            dataSource={users.map(user => ({
              value: user.email,
              text: userPresenter.getFullNameWithEmail(user),
            }))}
            autoFocus
            placeholder="type name or email..."
            onChange={email => setEmail(email)}
            onSelect={email => setEmail(email)}
          >
            <Input.Search
              style={{ width: 300 }}
              onSearch={value => searchEvaluators(campaignId, nominationId, value)}
            />
          </AutoComplete>
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={handleAdd}>{I18n.t('threesixty.add')}</Button>
          <Button type="default" onClick={hideForm}>{I18n.t('threesixty.cancel')}</Button>
        </Form.Item>
      </Form>
    </div>
  )
}
