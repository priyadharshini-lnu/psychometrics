import React, { useState } from 'react'
import _ from 'lodash'
import Row from './Row'
import css from './Table.scss'

const Table = () => {
  const [rows, updateRow] = useState(3)

  const addRow = () => updateRow(rows + 1)

  return (
    <table className={css.table}>
      <thead>
        <tr>
          <td>Email</td>
          <td>First Name</td>
          <td>Last Name</td>
        </tr>
      </thead>
      <tbody>
        {_.times(rows, index => (
          <Row key={index} isLast={rows === index + 1} addRow={addRow} />
        ))}
      </tbody>
    </table>
  )
}

export default Table
