import React from 'react'
import _ from 'lodash'
import { setIn } from 'utils/immutable'
import Row from './Row'
import css from './styles.scss'

const SpreadSheet = ({
  entities, rowSize, updateRowSize, updateEntities, fields,
}) => {
  const addRow = () => updateRowSize(rowSize + 1)

  const updateEntity = (path, value) => updateEntities(setIn(entities, path, value))

  return (
    <table className={css.table}>
      <thead>
        <tr>
          {fields.map(field => (
            <td key={field.key}>{field.name}</td>
          ))}
        </tr>
      </thead>
      <tbody>
        {_.times(rowSize, index => (
          <Row
            index={index}
            fields={fields}
            updateEntity={updateEntity}
            entity={entities[index] || {}}
            key={index}
            isLast={rowSize === index + 1}
            addRow={addRow}
          />
        ))}
      </tbody>
    </table>
  )
}

export default SpreadSheet
