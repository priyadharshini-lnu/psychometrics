import React, { useEffect } from 'react'
import { Button, Input } from "antd";
import OptionSection from './OptionSection'
import ExpandableOption from './ExpandableOption'
import CriteriaList from './DataSheet/CriteriaList'

import _ from "lodash";

export default function Options ({
  fetchParticipationOptions,
  updateParticipationOptions,
  addDatasheetCriteria,
  removeDatasheetCriteria,
  updateDatasheetCriteria,
  participantOptions,
  match: {
    params: { campaignId },
  }
}) {

  useEffect(() => {
    fetchParticipationOptions(campaignId)
  }, [])

  updateParticipationOptions = updateParticipationOptions.bind(this, campaignId)
  addDatasheetCriteria = addDatasheetCriteria.bind(this, campaignId)
  removeDatasheetCriteria = removeDatasheetCriteria.bind(this, campaignId)
  updateDatasheetCriteria = updateDatasheetCriteria.bind(this, campaignId)

  function parametersForSwitch(name) {
    return {
      value: participantOptions[name],
      onOptionChanged: updateParticipationOptions.bind(this, name)
    }
  }

  function parametersForDatasheet(name) {
    return {
      criterias: participantOptions[name],
      addCriteria: addDatasheetCriteria.bind(this, name),
      removeCriteria: removeDatasheetCriteria.bind(this, name),
      updateCriteria: updateDatasheetCriteria.bind(this, name)
    }

  }

  return (
    <div style={{padding: "10px 10px 20px 20px", maxWidth: "1159px"}}>
      <OptionSection label='Evaluator Options'>
        <ExpandableOption label='Allow evaluators to decline nomination' {...parametersForSwitch('evaluator_can_decline_nomination')}>
          <ExpandableOption label='Email subject when a nomination is declined' type="checkbox" {...parametersForSwitch('email_subject_when_evaluators_declines_nomination')}></ExpandableOption>
        </ExpandableOption>
      </OptionSection>

      <OptionSection label="Manager Options">
        <ExpandableOption label='Manager Can View Nominations' {...parametersForSwitch('manager_can_view_nominations')} actionable={<Button size="small">Default</Button>} />
        <ExpandableOption label='Manager May Choose Evaluators' {...parametersForSwitch('manager_can_choose_evaluators')}>
        </ExpandableOption>
        <ExpandableOption label='Manager Approve Nominations' {...parametersForSwitch('managers_approve_nominations')}>
          <div>
            <ExpandableOption label="Email managers when a subject's nominations are ready for approval" {...parametersForSwitch('email_managers_on_nomination_approval')} type="checkbox" actionable={<Button size="small">Edit email</Button>} />
          </div>
          <div>
            <ExpandableOption label="Allow subjects to email managers when their nominations are ready for approval" {...parametersForSwitch('subjects_can_email_managers')} type="checkbox" />
          </div>
          <div>
            <ExpandableOption label="Email subject when a nomination is declined" {...parametersForSwitch('email_subjects_when_manager_nominates_them')} type="checkbox" />
          </div>
          <div>
            <ExpandableOption label="Email subject when a nomination is denied" {...parametersForSwitch('email_subject_when_manager_declines_nomination')} type="checkbox" />
          </div>
        </ExpandableOption>
        <ExpandableOption label='Manager Approves Evaluations' {...parametersForSwitch('manager_approves_evaluations')}></ExpandableOption>
      </OptionSection>

      <OptionSection label="Subject Options">
        <ExpandableOption label='Subject Self Evaluates' {...parametersForSwitch('subject_can_evaluate_self')}>
          <ExpandableOption label="Limit self-evaluators by criteria" {...parametersForSwitch('limit_self_evaluation_by_criteria')} type="checkbox" actionable={<Button size="small">View 4 subjects</Button>}>
            <CriteriaList {...parametersForDatasheet('self_evaluation_criteria')}></CriteriaList>
          </ExpandableOption>

          <ExpandableOption label="Subjects can opt-in to this assessment" {...parametersForSwitch('subject_can_opt_in_assessment')} type="checkbox" actionable={<Button size="small">Opt-In-Link</Button>}>
            <ExpandableOption label="Restrict subject email to domains:" {...parametersForSwitch('restrict_subject_email_to_domail')} type="checkbox">
              <Input value={participantOptions['restricted_domain_name']} onChange={(e) => updateParticipationOptions('restricted_domain_name', e.target.value)} style={{maxWidth: "240px"}} placeholder="ex: gmail.com, yahoo.com" />
            </ExpandableOption>
          </ExpandableOption>
        </ExpandableOption>

        <ExpandableOption label='Subject Nominates Evaluators' {...parametersForSwitch('subject_can_nominate_evaluators')} actionable={<Button size="small">Define Nomination requirement</Button>}>
          <ExpandableOption label="Anyone not currently in the assessment" {...parametersForSwitch('subject_can_nominate_anyone_not_in_assessment')} type="checkbox" />
          <ExpandableOption label="Anyone in the assessment" {...parametersForSwitch('subject_can_nominate_anyone_in_assessment')} type="checkbox">
            <ExpandableOption label="Only show subjects who match the following criteria:" {...parametersForSwitch('limit_nomination_by_subject_to_anyone_in_assessment')} type="checkbox">
              <CriteriaList {...parametersForDatasheet('limit_nomination_by_subject_to_anyone_criteria')}></CriteriaList>
            </ExpandableOption>
          </ExpandableOption>
          <ExpandableOption label="Anyone in the DataSheet" {...parametersForSwitch('subject_can_nominate_anyone_from_datasheet')} type="checkbox">
            <ExpandableOption label="Limit search by criteria" {...parametersForSwitch('limit_nomination_by_subject_from_datasheet')} type="checkbox">
              <CriteriaList {...parametersForDatasheet('limit_nomination_by_subject_from_datasheet_criteria')}></CriteriaList>
            </ExpandableOption>
          </ExpandableOption>

          <ExpandableOption label="Subjects cannot remove nominations set by managers or admins" {...parametersForSwitch('subject_cannot_remove_nomination_set_by_manager_and_admin')} type="checkbox"></ExpandableOption>
          <ExpandableOption label="Allow subjects to select relationships" {...parametersForSwitch('subject_can_select_relationship')} type="checkbox">
            <ExpandableOption label="Only allow relationships of specified types" {...parametersForSwitch('limit_relationship_that_subject_can_select')} type="checkbox">
              <ExpandableOption label="Customer" {...parametersForSwitch('subject_can_select_customer_relationship')} type="checkbox" />
              <ExpandableOption label="Direct Report" {...parametersForSwitch('subject_can_select_direct_report_relationship')} type="checkbox" />
              <ExpandableOption label="Manager" {...parametersForSwitch('subject_can_select_manager_relationship')} type="checkbox" />
              <ExpandableOption label="Peer" {...parametersForSwitch('subject_can_select_peer_relationship')} type="checkbox" />
              <ExpandableOption label="Supplier" {...parametersForSwitch('subject_can_select_supplier_relationship')} type="checkbox" />
            </ExpandableOption>
          </ExpandableOption>
        </ExpandableOption>

        <ExpandableOption label='Subjects can view completion status of evaluations' {...parametersForSwitch('subject_can_view_completion_status_of_evaluation')} >
          <ExpandableOption label="Allow subjects to view the individual evaluations" {...parametersForSwitch('subject_can_view_individual_evaluations')} type="checkbox" />
        </ExpandableOption>
      </OptionSection>
    </div>
  )
}