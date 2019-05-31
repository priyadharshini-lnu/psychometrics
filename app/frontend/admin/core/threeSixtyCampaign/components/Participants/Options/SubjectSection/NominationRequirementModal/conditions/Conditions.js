import React from 'react'
import _ from 'lodash'
import Condition from './Condition'

export default function Conditions ({
  relationships,
  conditions,
  add,
  remove,
  update,
}) {
  return (
    <div className="mlm">
      {conditions.map((condition, index) => (
        <div key={index}>
          <Condition
            relationships={relationships}
            condition={condition}
            add={() => add(_.get(relationships, [0, 'id']))}
            remove={() => remove(index)}
            update={(field, value) => update(index, field, value)}
          />
        </div>
      ))}
    </div>
  )
}
