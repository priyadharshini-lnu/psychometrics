import React from 'react'
import './styles.less'
import RequirementTable from './RequirementTable/RequirementTable'

export default function NominationTable ({ requirements, ...props }) {
  return (
    <div className="nominations-table">
      {requirements.map((requirement, i) => (
        <RequirementTable
          key={i}
          requirement={requirement}
          {...props}
        />
      ))}
    </div>
  )
}
