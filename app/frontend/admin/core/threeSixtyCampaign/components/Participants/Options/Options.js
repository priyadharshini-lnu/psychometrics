import React, { useEffect } from 'react'
import { Button } from 'antd'
import OptionSection from './OptionSection'
import ExpandableOption from './ExpandableOption'
import css from './Options.scss'
import SubjectSection from './Sections/SubjectSection'

export default function Options ({
  fetchParticipantOptions,
  updateParticipantOptions,
  addDatasheetCriteria,
  removeDatasheetCriteria,
  updateDatasheetCriteria,
  setCurrentCampaignId,
  options,
  datasheetFields,
  match: {
    params: { campaignId },
  },
}) {
  useEffect(() => {
    setCurrentCampaignId(campaignId)
    fetchParticipantOptions(campaignId)
  }, [])

  // const updateParticipantOptions = updateParticipantOptions.bind(this, campaignId)
  // const addDatasheetCriteria = addDatasheetCriteria.bind(this, campaignId)
  // const removeDatasheetCriteria = removeDatasheetCriteria.bind(this, campaignId)
  // const updateDatasheetCriteria = updateDatasheetCriteria.bind(this, campaignId)

  function parametersForSwitch (name) {
    return {
      value: options[name],
      onOptionChanged: updateParticipantOptions.bind(this, name),
    }
  }

  function parametersForDatasheet (name) {
    return {
      fields: datasheetFields,
      criteria: options[name],
      addCriteria: addDatasheetCriteria.bind(this, name),
      removeCriteria: removeDatasheetCriteria.bind(this, name),
      updateCriteria: updateDatasheetCriteria.bind(this, name),
    }
  }

  return (
    <div className={css.optionContainer}>
      <OptionSection label="Evaluator Options">
        <ExpandableOption
          label="Allow evaluators to decline nomination"
          {...parametersForSwitch('evaluatorCanDeclineNomination')}
        >
          <ExpandableOption
            label="Email subject when a nomination is declined"
            type="checkbox"
            {...parametersForSwitch('emailSubjectWhenEvaluatorsDeclinesNomination')}
          />
        </ExpandableOption>
      </OptionSection>

      <OptionSection label="Manager Options">
        <ExpandableOption label="Manager Can View Nominations" {...parametersForSwitch('managerCanViewNominations')} />
        <ExpandableOption
          label="Manager May Choose Evaluators"
          {...parametersForSwitch('managerCanChooseEvaluators')}
        />
        <ExpandableOption label="Manager Approve Nominations" {...parametersForSwitch('managersApproveNominations')}>
          <div>
            <ExpandableOption
              label="Email managers when a subject's nominations are ready for approval"
              {...parametersForSwitch('emailManagersOnNominationApproval')}
              type="checkbox"
              actionable={<Button size="small">Edit email</Button>}
            />
          </div>
          <div>
            <ExpandableOption
              label="Allow subjects to email managers when their nominations are ready for approval"
              {...parametersForSwitch('subjectsCanEmailManagers')}
              type="checkbox"
            />
          </div>
          <div>
            <ExpandableOption
              label="Email subject when a nomination is declined"
              {...parametersForSwitch('emailSubjectsWhenManagerNominatesThem')}
              type="checkbox"
            />
          </div>
          <div>
            <ExpandableOption
              label="Email subject when a nomination is denied"
              {...parametersForSwitch('emailSubjectWhenManagerDeclinesNomination')}
              type="checkbox"
            />
          </div>
        </ExpandableOption>
        <ExpandableOption label="Manager Approves Evaluations" {...parametersForSwitch('managerApprovesEvaluations')} />
      </OptionSection>

      <SubjectSection parametersForSwitch={parametersForSwitch} parametersForDatasheet={parametersForDatasheet} />
    </div>
  )
}
