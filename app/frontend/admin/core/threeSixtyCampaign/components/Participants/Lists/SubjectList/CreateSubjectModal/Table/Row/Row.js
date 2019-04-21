import React from 'react'

const Row = ({ isLast, addRow }) => {
  const onKeyDown = ({ key }) => {
    if (key === 'Tab' && isLast) addRow()
  }

  return (
    <tr>
      <td>
        <input />
      </td>
      <td>
        <input />
      </td>
      <td>
        <input onKeyDown={onKeyDown} />
      </td>
    </tr>
  )
}

export default Row
