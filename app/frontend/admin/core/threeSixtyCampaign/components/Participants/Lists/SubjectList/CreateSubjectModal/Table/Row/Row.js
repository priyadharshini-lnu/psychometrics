import React from 'react'

export default function Row ({
  isLast, addRow, updateSubject, index, subject: { email, firstName, lastName },
}) {
  const onKeyDown = ({ key }) => {
    if (key === 'Tab' && isLast) addRow()
  }

  const onChange = ({ currentTarget }) => {
    updateSubject([index, currentTarget.name], currentTarget.value)
  }

  return (
    <tr>
      <td>
        <input name="email" value={email || ''} onChange={onChange} />
      </td>
      <td>
        <input name="firstName" value={firstName || ''} onChange={onChange} />
      </td>
      <td>
        <input name="lastName" onKeyDown={onKeyDown} value={lastName || ''} onChange={onChange} />
      </td>
    </tr>
  )
}
