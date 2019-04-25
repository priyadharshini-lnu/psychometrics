import React from 'react'
import _ from 'lodash'
import { setIn } from 'utils/immutable'
import Row from './Row'
import css from './Table.scss'

const Table = ({
  subjects, rowSize, updateRowSize, updateSubjects,
}) => {
  const addRow = () => updateRowSize(rowSize + 1)

  const updateSubject = (path, value) => updateSubjects(setIn(subjects, path, value))

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
        {_.times(rowSize, index => (
          <Row
            index={index}
            updateSubject={updateSubject}
            subject={subjects[index] || {}}
            key={index}
            isLast={rowSize === index + 1}
            addRow={addRow}
          />
        ))}
      </tbody>
    </table>
  )
}

export default Table
