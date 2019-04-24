import React, { useEffect, useState } from 'react'
import { Row, Col, Switch, Checkbox, Button } from "antd";

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
    <div style={{padding: "10px 10px 20px 20px"}}>
      <OptionSection label="Evaluator Options">
        <OptionSwitch label='Allow evaluators to decline nomination' value={option} onOptionChanged={setOption}>
          <Checkbox onChange={() => {}}>Email subject when a nomination is declined</Checkbox>
        </OptionSwitch>
      </OptionSection>
      <OptionSection label="Manager Options">
        <OptionSwitch label='Manager Can View Nominations' value={option} onOptionChanged={setOption} actionable={<Button size="small">Default</Button>}>
        </OptionSwitch>
        <OptionSwitch label='Manager May Choose Evaluators' value={option} onOptionChanged={setOption}>
        </OptionSwitch>
        <OptionSwitch label='Manager Approve Nominations' value={option1} onOptionChanged={setOption1}>
          <div>
            <Checkbox onChange={() => {}}>Email managers when a subject's nominations are ready for approval</Checkbox>
          </div>
          <div>
            <Checkbox onChange={() => {}}>Allow subjects to email managers when their nominations are ready for approval</Checkbox>
          </div>
          <div>
            <Checkbox onChange={() => {}}>Email subject when a nomination is declined</Checkbox>
          </div>
          <div>
            <Checkbox onChange={() => {}}>Email subject when a nomination is denied</Checkbox>
          </div>
        </OptionSwitch>
        <OptionSwitch label='Manager Approves Evaluations' value={option} onOptionChanged={setOption}></OptionSwitch>
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

function OptionSwitch({label, value, onOptionChanged, actionable, children}) {
  function renderExapandableBlock() {
    if (value && children) {
      return (
        <Row style={{marginTop: "8px"}}>
          <Col xxl={1} md={3} xs={4} />
          <Col span={20}>
            {children}
          </Col>
        </Row>
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
    <div style={{marginBottom: "20px"}}>
      <Row>
        <Col xxl={1} md={3} xs={4} >
          <div>
            <Switch checkedChildren="On" unCheckedChildren="Off" defaultChecked checked={value} onChange={onOptionChanged} />
          </div>
        </Col>
        <Col span={12} >
          {label}
          {renderActionable()}
        </Col>
      </Row>
      {renderExapandableBlock()}
    </div>
  )
}