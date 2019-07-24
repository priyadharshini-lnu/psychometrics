import React, { useEffect, useState } from 'react'
import _ from 'lodash'
import { setIn } from 'utils/immutable'
import Row from './Row'
import css from './styles.scss'

const MIN_ROW_SIZE = 3
const SpreadSheet = ({
  entities, updateEntities, fields, context,
}) => {
  const [rowSize, setRowSize] = useState(MIN_ROW_SIZE)

  useEffect(() => {
    if (_.size(entities) > rowSize) {
      setRowSize(rowSize + 1)
    }
  }, [entities])

  const addRow = () => setRowSize(rowSize + 1)

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
            context={context}
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
