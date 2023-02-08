import React from 'react'
import _ from 'lodash'
import ReminderRule from './ReminderRule'

export default function ReminderRules ({
  rules, add, remove, update,
}) {
  return (
    <div>
      {_.map(rules, (rule, index) => (
        <ReminderRule
          key={index}
          rule={rule}
          add={add}
          remove={() => remove(index)}
          update={(field, value) => update(index, field, value)}
        />
      ))}
    </div>
  )
}
