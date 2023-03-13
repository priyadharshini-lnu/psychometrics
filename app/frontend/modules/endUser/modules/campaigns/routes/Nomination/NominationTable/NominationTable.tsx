import React from 'react'
import _ from 'lodash'
import { RequirementTable } from './RequirementTable/RequirementTable'

export const NominationTable = ({ requirements, ...props }) => {
  const manager = _.remove(requirements, { title: 'Manager' })

  return (
    <div>
      {[...manager, ...requirements].map((requirement, i) => (
        <RequirementTable
          key={i}
          requirement={requirement}
          {...props}
        />
      ))}
    </div>
  )
}
