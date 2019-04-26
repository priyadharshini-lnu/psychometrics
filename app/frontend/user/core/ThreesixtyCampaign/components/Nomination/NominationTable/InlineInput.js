import React, { useState } from 'react'
import {
  Input, Button, Form,
} from 'antd'


export default function InlineInput ({ title, role, addNomination }) {
  const [edit, setEdit] = useState(false)
  const [name, setName] = useState('')
  const [hasErrors, setHasErrors] = useState({ name: false })

  const handleAdd = () => {
    if (name) {
      addNomination({ name, role })
      setName('')
    } else {
      const errors = { name: false, role: false }
      if (!name) { errors.name = true }
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
              validateStatus={hasErrors.name ? 'error' : ''}
              help={hasErrors.name ? 'Name is required' : ''}
            >
              <Input value={name} placeholder="type name or email..." onChange={({ currentTarget: { value } }) => setName(value)} />
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
