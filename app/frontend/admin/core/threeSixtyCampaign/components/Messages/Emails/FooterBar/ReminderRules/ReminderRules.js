import React from 'react'
import _ from 'lodash'
import ReminderRule from './ReminderRule'

export default function({ rules, add, remove, update }) {
  console.log(rules)
  return(
    <div>
      {_.map(rules, (rule, index) => {
        return <ReminderRule
          key={index}
          rule={rule}
          add={add}
          remove={() => remove(index)}
          update={(field, value) => update(index, field, value)} />
      })}
    </div>
  )
}
