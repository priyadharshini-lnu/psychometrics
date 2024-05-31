import { useState } from 'react'
import {
  Input, Button, Form, AutoComplete, Space,
} from 'antd'
import { useParams } from 'react-router-dom'
import userPresenter from '~/presenters/user'
import styles from './InlineInput.less'

const { I18n } = window

export const InlineInput = ({
  relationship, handleAddNomination, searchEvaluators, hideForm,
  autocomplete: { users },
}) => {
  const { campaignId, nominationId } = useParams() as { campaignId: string, nominationId: string }
  const [email, setEmail] = useState(null)
  const [hasErrors, setHasErrors] = useState<{email: boolean, user?: boolean, relationship?: boolean}>(
    { email: false, user: false },
  )

  const handleAdd = () => {
    if (email) {
      handleAddNomination({
        campaignId, nominationId, email, relationshipId: relationship,
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
    <>
      <Form layout="inline">
        <Form.Item
          validateStatus={hasErrors.user ? 'error' : ''}
          help={hasErrors.email ? 'Email is required' : ''}
          className={styles.searchField}
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
          <Space>
            <Button type="primary" onClick={handleAdd}>{I18n.t('threesixty.add')}</Button>
            <Button type="default" onClick={hideForm}>{I18n.t('threesixty.cancel')}</Button>
          </Space>
        </Form.Item>
      </Form>
    </>
  )
}
