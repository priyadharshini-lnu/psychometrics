import React, { useEffect, useState } from 'react'
import { Row, Col, Switch, Checkbox, Button, Input, Select, Icon, Anchor } from "antd";
import _ from "lodash";

export default function Options ({
  fetchParticipationOptions,
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

  return (
    <div style={{padding: "10px 10px 20px 20px", maxWidth: "1159px"}}>
      <OptionSection label="Evaluator Options">
        <OptionSwitch label='Allow evaluators to decline nomination' value={option} onOptionChanged={setOption}>
          <Checkbox onChange={() => {}}>Email subject when a nomination is declined</Checkbox>
        </OptionSwitch>
      </OptionSection>

      <OptionSection label="Manager Options">
        <OptionSwitch label='Manager Can View Nominations' value={option} onOptionChanged={setOption} actionable={<Button size="small">Default</Button>} />
        <OptionSwitch label='Manager May Choose Evaluators' value={option} onOptionChanged={setOption}>
        </OptionSwitch>
        <OptionSwitch label='Manager Approve Nominations' value={option1} onOptionChanged={setOption1}>
          <div>
            <OptionSwitch label="Email managers when a subject's nominations are ready for approval" value={option} type="checkbox" onOptionChanged={setOption} actionable={<Button size="small">Edit email</Button>} />
          </div>
          <div>
            <OptionSwitch label="Allow subjects to email managers when their nominations are ready for approval" value={option} type="checkbox" onOptionChanged={setOption} />
          </div>
          <div>
            <OptionSwitch label="Email subject when a nomination is declined" value={option} type="checkbox" onOptionChanged={setOption} />
          </div>
          <div>
            <OptionSwitch label="Email subject when a nomination is denied" value={option} type="checkbox" onOptionChanged={setOption} />
          </div>
        </OptionSwitch>
        <OptionSwitch label='Manager Approves Evaluations' value={option} onOptionChanged={setOption}></OptionSwitch>
      </OptionSection>

      <OptionSection label="Subject Options">
        <OptionSwitch label='Subject Self Evaluates' value={option} onOptionChanged={setOption}>
          <OptionSwitch label="Limit self-evaluators by criteria" value={option} type="checkbox" onOptionChanged={setOption} actionable={<Button size="small">View 4 subjects</Button>}>
            <DataSheetConditionGenerator></DataSheetConditionGenerator>
          </OptionSwitch>

          <OptionSwitch label="Subjects can opt-in to this assessment" value={option} type="checkbox" onOptionChanged={setOption} actionable={<Button size="small">Opt-In-Link</Button>}>
            <OptionSwitch label="Restrict subject email to domains:" value={option} type="checkbox" onOptionChanged={setOption}>
              <Input style={{maxWidth: "240px"}} placeholder="ex: gmail.com, yahoo.com" />
            </OptionSwitch>
          </OptionSwitch>
        </OptionSwitch>

        <OptionSwitch label='Subject Nominates Evaluators' value={option} onOptionChanged={setOption} actionable={<Button size="small">Define Nomination requirement</Button>}>
          <OptionSwitch label="Anyone not currently in the assessment" value={option} type="checkbox" onOptionChanged={setOption} />
          <OptionSwitch label="Anyone in the assessment" value={option} type="checkbox" onOptionChanged={setOption}>
            <OptionSwitch label="Only show subjects who match the following criteria:" type="checkbox" onOptionChanged={setOption}>
              <DataSheetConditionGenerator></DataSheetConditionGenerator>
            </OptionSwitch>
          </OptionSwitch>
          <OptionSwitch label="Anyone in the DataSheet" value={option} type="checkbox" onOptionChanged={setOption}>
            <OptionSwitch label="Limit search by criteria" type="checkbox"  value={option} onOptionChanged={setOption}>
              <DataSheetConditionGenerator></DataSheetConditionGenerator>
            </OptionSwitch>
          </OptionSwitch>

          <OptionSwitch label="Subjects cannot remove nominations set by managers or admins" value={option} type="checkbox" onOptionChanged={setOption}></OptionSwitch>

          <OptionSwitch label="Allow subjects to select relationships" value={option} type="checkbox" onOptionChanged={setOption} actionable={<Button size="small">Manage Relationships</Button>}>
            <OptionSwitch label="Only allow relationships of specified types" value={option} type="checkbox" onOptionChanged={setOption}>
              <OptionSwitch label="Customer" type="checkbox" onOptionChanged={setOption} />
              <OptionSwitch label="Direct Report" type="checkbox" onOptionChanged={setOption} />
              <OptionSwitch label="Manager" type="checkbox" onOptionChanged={setOption} />
              <OptionSwitch label="Peer" type="checkbox" onOptionChanged={setOption} />
              <OptionSwitch label="Supplier" type="checkbox" onOptionChanged={setOption} />
            </OptionSwitch>
          </OptionSwitch>
        </OptionSwitch>

        <OptionSwitch label='Subjects can view completion status of evaluations' value={option} onOptionChanged={setOption}>
          <OptionSwitch label="Allow subjects to view the individual evaluations" type="checkbox" onOptionChanged={setOption} />
        </OptionSwitch>
      </OptionSection>
    </div>
  )
}



// {
//   evaluators: { can_decline_nominations: true, email_subject_when_nomination_declined: true }
//   managers: { can_view_nomination: true, can_choose_nominations: true},
//   subjects: { can_self_evaluate: true, limit_self_evaluators: false}
// }

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

class DataSheetConditionGenerator extends React.Component {
  state = { conditions: [
    { field: "gender", operator: "equal", value: "10" },
    { field: "grade", operator: "is_same_as_subject" }
  ]}

  addCondition = () => {
    this.state.conditions.push({ field: null, operator: "is_same_as_subject" })
    this.setState({conditions: this.state.conditions})
  }

  removeCondition = (index) => {
    console.log(index)
    this.state.conditions.splice(index, 1);
    this.setState({conditions: this.state.conditions})
  }

  updateCondition = (index, name, value) => {
    let data = this.state.conditions[index];
    this.state.conditions[index] = {...data, [name]: value};
    this.setState({conditions: this.state.conditions})
  }

  render() {
    return < ADataSheetConditionGenerator conditions={this.state.conditions} addCondition={this.addCondition}
      removeCondition={this.removeCondition} updateCondition={this.updateCondition} />
  }
}

function ADataSheetConditionGenerator({ conditions, addCondition, removeCondition, updateCondition }) {
  if (_.isEmpty(conditions)) {
    return <a onClick={addCondition}>Click here to add conditions</a>
  } else {
    return conditions.map((condition, index) => {
      return (
        <div style={{marginBottom: "4px"}} key={Math.random()}>
          <DataSheetCondition condition={condition} updateCondition={updateCondition.bind(this, index)} />
          <span>
            <Icon type="minus-circle" onClick={removeCondition.bind(this, index)} style={{marginLeft: "10px", fontSize: "18px"}} />
            <Icon type="plus-circle" onClick={addCondition} style={{marginLeft: "5px", fontSize: "18px"}} />
          </span>
        </div>
      )
    })
  }
}


function DataSheetCondition({condition: { field, operator, value }, updateCondition}) {
  let valueAttr = field ? {value: field} : {};

  return (
    <span>
      <Select {...valueAttr} size="small" style={{width: 200}} placeholder="Select a datasheet field" onChange={(value) => { updateCondition("field", value) }}>
        <Select.Option key="gender">Gender</Select.Option>
        <Select.Option key="grade">Grade</Select.Option>
        <Select.Option key="language">Language</Select.Option>
      </Select>
      <Select value={operator} size="small" style={{margin: "0px 10px"}} onChange={(value) => { updateCondition("operator", value) }}>
        <Select.Option key="is_same_as_subject">Is Same as Subject</Select.Option>
        <Select.Option key="equal">Is</Select.Option>
      </Select>
      {operator == "equal" ? <Input value={value} style={{marginRight: 10}} size="small" style={{width: 120}} onChange={(e) => { updateCondition("value", e.target.value) }} /> : null}
    </span>
  )
}
