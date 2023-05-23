import { RequirementTable } from './RequirementTable/RequirementTable'

export const NominationTable = ({ requirements, ...props }) => (
  <div>
    {requirements.map((requirement, i) => (
      <RequirementTable
        key={i}
        requirement={requirement}
        {...props}
      />
    ))}
  </div>
)
