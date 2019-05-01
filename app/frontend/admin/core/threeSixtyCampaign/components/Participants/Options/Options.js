import React, { useEffect } from 'react'
import { Button } from 'antd'
import OptionSection from './OptionSection'
import ExpandableOption from './ExpandableOption'
import CriteriaList from './DataSheet/CriteriaList'

export default function Options ({
  fetchParticipationOptions,
  updateParticipationOptions,
  addDatasheetCriteria,
  removeDatasheetCriteria,
  updateDatasheetCriteria,
  options,
  datasheetFields,
  match: {
    params: { campaignId },
  },
}) {
  useEffect(() => {
    fetchParticipationOptions(campaignId)
  }, [])

  const boundedUpdateParticipationOptions = updateParticipationOptions.bind(this, campaignId)
  const boundedAddDatasheetCriteria = addDatasheetCriteria.bind(this, campaignId)
  const boundedRemoveDatasheetCriteria = removeDatasheetCriteria.bind(this, campaignId)
  const boundedUpdateDatasheetCriteria = updateDatasheetCriteria.bind(this, campaignId)

  function parametersForSwitch (name) {
    return {
      value: options[name],
      onOptionChanged: boundedUpdateParticipationOptions.bind(this, name),
    }
  }

  function parametersForDatasheet (name) {
    return {
      fields: datasheetFields,
      criteria: options[name],
      addCriteria: boundedAddDatasheetCriteria.bind(this, name),
      removeCriteria: boundedRemoveDatasheetCriteria.bind(this, name),
      updateCriteria: boundedUpdateDatasheetCriteria.bind(this, name),
    }
  }

  return (
    <div style={{ padding: '10px 10px 20px 20px', maxWidth: '1159px' }}>
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
        <ExpandableOption
          label="Manager Can View Nominations"
          {...parametersForSwitch('managerCanViewNominations')}
          actionable={<Button size="small">Default</Button>}
        />
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

      <OptionSection label="Subject Options">
        <ExpandableOption label="Subject Self Evaluates" {...parametersForSwitch('subjectCanEvaluateSelf')}>
          <ExpandableOption
            label="Limit self-evaluators by criteria"
            {...parametersForSwitch('limitSelfEvaluationByCriteria')}
            type="checkbox"
            actionable={<Button size="small">View 4 subjects</Button>}
          >
            <CriteriaList {...parametersForDatasheet('selfEvaluationCriteria')} />
          </ExpandableOption>
        </ExpandableOption>

        <ExpandableOption
          label="Subject Nominates Evaluators"
          {...parametersForSwitch('subjectCanNominateEvaluators')}
          actionable={<Button size="small">Define Nomination requirement</Button>}
        >
          <ExpandableOption
            label="Anyone not currently in the assessment"
            {...parametersForSwitch('subjectCanNominateAnyoneNotInAssessment')}
            type="checkbox"
          />
          <ExpandableOption
            label="Anyone in the assessment"
            {...parametersForSwitch('subjectCanNominateAnyoneInAssessment')}
            type="checkbox"
          >
            <ExpandableOption
              label="Only show subjects who match the following criteria:"
              {...parametersForSwitch('limitNominationBySubjectToAnyoneInAssessment')}
              type="checkbox"
            >
              <CriteriaList {...parametersForDatasheet('limitNominationBySubjectToAnyoneCriteria')} />
            </ExpandableOption>
          </ExpandableOption>
          <ExpandableOption
            label="Anyone in the DataSheet"
            {...parametersForSwitch('subjectCanNominateAnyoneFromDatasheet')}
            type="checkbox"
          >
            <ExpandableOption
              label="Limit search by criteria"
              {...parametersForSwitch('limitNominationbySubjectFromDatasheet')}
              type="checkbox"
            >
              <CriteriaList {...parametersForDatasheet('limitNominationbySubjectFromDatasheetCriteria')} />
            </ExpandableOption>
          </ExpandableOption>

          <ExpandableOption
            label="Subjects cannot remove nominations set by managers or admins"
            {...parametersForSwitch('subjectCannotRemoveNominationSetByManagerAndAdmin')}
            type="checkbox"
          />
          <ExpandableOption
            label="Allow subjects to select relationships"
            {...parametersForSwitch('subjectCanSelectRelationship')}
            type="checkbox"
          >
            <ExpandableOption
              label="Only allow relationships of specified types"
              {...parametersForSwitch('limitRelationshipThatSubjectCanSelect')}
              type="checkbox"
            >
              <ExpandableOption
                label="Customer"
                {...parametersForSwitch('subjectCanSelectCustomerRelationship')}
                type="checkbox"
              />
              <ExpandableOption
                label="Direct Report"
                {...parametersForSwitch('subjectCanSelectDirectReportRelationship')}
                type="checkbox"
              />
              <ExpandableOption
                label="Manager"
                {...parametersForSwitch('subjectCanSelectManagerRelationship')}
                type="checkbox"
              />
              <ExpandableOption
                label="Peer"
                {...parametersForSwitch('subjectCanSelectPeerRelationship')}
                type="checkbox"
              />
              <ExpandableOption
                label="Supplier"
                {...parametersForSwitch('subjectCanSelectSupplierRelationship')}
                type="checkbox"
              />
            </ExpandableOption>
          </ExpandableOption>
        </ExpandableOption>

        <ExpandableOption
          label="Subjects can view completion status of evaluations"
          {...parametersForSwitch('subjectCanViewCompletionStatusOfEvaluation')}
        >
          <ExpandableOption
            label="Allow subjects to view the individual evaluations"
            {...parametersForSwitch('subjectCanViewIndividualEvaluations')}
            type="checkbox"
          />
        </ExpandableOption>
      </OptionSection>
    </div>
  )
}
