import React, { useEffect, useState } from 'react'
import { Row, Col, Switch, Checkbox, Button, Input, Select, Icon } from "antd";
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

  const [option, setOption] = useState(true);
  const [option1, setOption1] = useState(true);

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
        <OptionSwitch label='Allow evaluators to decline nomination' {...parametersForSwitch('evaluator_can_decline_nomination')}>
          <OptionSwitch label='Email subject when a nomination is declined' type="checkbox" {...parametersForSwitch('email_subject_when_evaluators_declines_nomination')}></OptionSwitch>
        </OptionSwitch>
      </OptionSection>

      <OptionSection label="Manager Options">
        <OptionSwitch label='Manager Can View Nominations' {...parametersForSwitch('manager_can_view_nominations')} actionable={<Button size="small">Default</Button>} />
        <OptionSwitch label='Manager May Choose Evaluators' {...parametersForSwitch('manager_can_choose_evaluators')}>
        </OptionSwitch>
        <OptionSwitch label='Manager Approve Nominations' {...parametersForSwitch('managers_approve_nominations')}>
          <div>
            <OptionSwitch label="Email managers when a subject's nominations are ready for approval" {...parametersForSwitch('email_managers_on_nomination_approval')} type="checkbox" actionable={<Button size="small">Edit email</Button>} />
          </div>
          <div>
            <OptionSwitch label="Allow subjects to email managers when their nominations are ready for approval" {...parametersForSwitch('subjects_can_email_managers')} type="checkbox" />
          </div>
          <div>
            <OptionSwitch label="Email subject when a nomination is declined" {...parametersForSwitch('email_subjects_when_manager_nominates_them')} type="checkbox" />
          </div>
          <div>
            <OptionSwitch label="Email subject when a nomination is denied" {...parametersForSwitch('email_subject_when_manager_declines_nomination')} type="checkbox" />
          </div>
        </OptionSwitch>
        <OptionSwitch label='Manager Approves Evaluations' {...parametersForSwitch('manager_approves_evaluations')}></OptionSwitch>
      </OptionSection>

      <OptionSection label="Subject Options">
        <OptionSwitch label='Subject Self Evaluates' {...parametersForSwitch('subject_can_evaluate_self')}>
          <OptionSwitch label="Limit self-evaluators by criteria" {...parametersForSwitch('limit_self_evaluation_by_criteria')} type="checkbox" actionable={<Button size="small">View 4 subjects</Button>}>
            <DataSheetCriteriaGenerator {...parametersForDatasheet('self_evaluation_criteria')}></DataSheetCriteriaGenerator>
          </OptionSwitch>

          <OptionSwitch label="Subjects can opt-in to this assessment" {...parametersForSwitch('subject_can_opt_in_assessment')} type="checkbox" actionable={<Button size="small">Opt-In-Link</Button>}>
            <OptionSwitch label="Restrict subject email to domains:" {...parametersForSwitch('restrict_subject_email_to_domail')} type="checkbox">
              <Input style={{maxWidth: "240px"}} placeholder="ex: gmail.com, yahoo.com" />
            </OptionSwitch>
          </OptionSwitch>
        </OptionSwitch>

        <OptionSwitch label='Subject Nominates Evaluators' {...parametersForSwitch('subject_can_nominate_evaluators')} actionable={<Button size="small">Define Nomination requirement</Button>}>
          <OptionSwitch label="Anyone not currently in the assessment" {...parametersForSwitch('subject_can_nominate_anyone_not_in_assessment')} type="checkbox" />
          <OptionSwitch label="Anyone in the assessment" {...parametersForSwitch('subject_can_nominate_anyone_in_assessment')} type="checkbox">
            <OptionSwitch label="Only show subjects who match the following criteria:" {...parametersForSwitch('limit_nomination_by_subject_to_anyone_in_assessment')} type="checkbox">
              <DataSheetCriteriaGenerator {...parametersForDatasheet('limit_nomination_by_subject_to_anyone_criteria')}></DataSheetCriteriaGenerator>
            </OptionSwitch>
          </OptionSwitch>
          <OptionSwitch label="Anyone in the DataSheet" {...parametersForSwitch('subject_can_nominate_anyone_from_datasheet')} type="checkbox">
            <OptionSwitch label="Limit search by criteria" {...parametersForSwitch('limit_nomination_by_subject_from_datasheet')} type="checkbox">
              <DataSheetCriteriaGenerator {...parametersForDatasheet('limit_nomination_by_subject_from_datasheet_criteria')}></DataSheetCriteriaGenerator>
            </OptionSwitch>
          </OptionSwitch>

          <OptionSwitch label="Subjects cannot remove nominations set by managers or admins" {...parametersForSwitch('subject_cannot_remove_nomination_set_by_manager_and_admin')} type="checkbox"></OptionSwitch>
          <OptionSwitch label="Allow subjects to select relationships" {...parametersForSwitch('subject_can_select_relationship')} type="checkbox"actionable={<Button size="small">Manage Relationships</Button>}>
            <OptionSwitch label="Only allow relationships of specified types" {...parametersForSwitch('limit_relationship_that_subject_can_select')} type="checkbox">
              <OptionSwitch label="Customer" type="checkbox" onOptionChanged={setOption} />
              <OptionSwitch label="Direct Report" type="checkbox" onOptionChanged={setOption} />
              <OptionSwitch label="Manager" type="checkbox" onOptionChanged={setOption} />
              <OptionSwitch label="Peer" type="checkbox" onOptionChanged={setOption} />
              <OptionSwitch label="Supplier" type="checkbox" onOptionChanged={setOption} />
            </OptionSwitch>
          </OptionSwitch>
        </OptionSwitch>

        <OptionSwitch label='Subjects can view completion status of evaluations' {...parametersForSwitch('subject_can_view_completion_status_of_evaluation')} >
          <OptionSwitch label="Allow subjects to view the individual evaluations" {...parametersForSwitch('subject_can_view_individual_evaluations')} type="checkbox" />
        </OptionSwitch>
      </OptionSection>
    </div>
  )
}

function OptionSection({label, children}) {
  return (
    <div style={{marginTop: "25px"}}>
      <div style={{fontWeight: "bold"}}>{label}</div>
      <div style={{marginTop: "5px"}}>
        {children}
      </div>
    </div>
  )
}

function OptionSwitch({label, value, onOptionChanged, actionable, children, type}) {
  function renderExapandableBlock() {
    if (value && children) {
      return (
        <div style={type == "checkbox" ? {marginLeft: "26px", marginTop: "8px"} : {}}>
          {children}
        </div>
      )
    }
  }

  function renderActionable() {
    if (value && actionable) {
      return (
        <span style={{marginLeft: "25px"}}>
          {actionable}
        </span>
      )
    }
  }

  return (
    <div style={{marginBottom: `${type == "checkbox" ? "5px" : "20px"}`}}>
      <Row>
        <Col span={24}>
          <Row>
            {type != "checkbox" ? <Col md={2} sm={3} xs={4} >
              <div>
                <Switch checkedChildren="On" unCheckedChildren="Off" defaultChecked checked={value} onChange={onOptionChanged} />
              </div>
            </Col> : null}
            <Col md={22} sm={21} xs={20} >
              {type == "checkbox" ? <Checkbox onChange={(e) => onOptionChanged(e.target.checked)} checked={value} style={{marginRight: "5px"}}/> : null}
              {label}
              {renderActionable()}
              {renderExapandableBlock()}
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  )
}

function DataSheetCriteriaGenerator({ criterias, addCriteria, removeCriteria, updateCriteria }) {
  if (_.isEmpty(criterias)) {
    return <a onClick={addCriteria}>Click here to add criterias</a>
  } else {
    return criterias.map((condition, index) => {
      return (
        <div style={{marginBottom: "4px"}} key={index}>
          <DataSheetCriteria condition={condition} updateCriteria={updateCriteria.bind(this, index)} />
          <span style={{verticalAlign: 'middele'}}>
            <Icon type="minus-circle" onClick={removeCriteria.bind(this, index)} style={{fontSize: "18px"}} />
            <Icon type="plus-circle" onClick={addCriteria} style={{marginLeft: "5px", fontSize: "18px"}} />
          </span>
        </div>
      )
    })
  }
}

function DataSheetCriteria({condition: { field, operator, value }, updateCriteria}) {
  let valueAttr = field ? {value: field} : {};

  return (
    <span>
      <Select {...valueAttr} size="small" style={{width: '160px'}} placeholder="Select a datasheet field" onChange={(value) => { updateCriteria("field", value) }}>
        <Select.Option key="gender">Gender</Select.Option>
        <Select.Option key="grade">Grade</Select.Option>
        <Select.Option key="language">Language</Select.Option>
      </Select>
      <Select value={operator} size="small" style={{margin: "0px 10px", width: "160px"}} onChange={(value) => { updateCriteria("operator", value) }}>
        <Select.Option key="is_same_as_subject">Is Same as Subject</Select.Option>
        <Select.Option key="equal">Is</Select.Option>
      </Select>
      {operator == "equal" ? <Input value={value} style={{marginRight: '10px', width: '160px'}} size="small" onChange={(e) => { updateCriteria("value", e.target.value) }} /> : null}
    </span>
  )
}
