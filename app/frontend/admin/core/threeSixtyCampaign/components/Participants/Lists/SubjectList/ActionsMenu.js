import React from 'react'
import { Menu } from 'antd'

const ActionsMenu = ({
  subjectId,
  campaignId,
  approveReport,
  removeReportApprove,
  releaseReport,
  holdReport,
  removeReleasedHoldStatus,
  markEvaluationAsComplete,
  unmarkEvaluationAsComplete,
  removeSubject,
}) => (
  <Menu>
    <Menu.Item key="0">
      <a href={`/administration/threesixty_campaigns/${campaignId}/subjects/${subjectId}/spoof`}>Login</a>
    </Menu.Item>
    <Menu.Item key="1">
      <a href="nth">View Report</a>
    </Menu.Item>
    <Menu.Divider />
    <Menu.Item key="3">
      <div onClick={() => approveReport(subjectId)} role="button" tabIndex={-1}>
        Approve Report...
      </div>
    </Menu.Item>
    <Menu.Item key="4">
      <div onClick={() => removeReportApprove(subjectId)} role="button" tabIndex={-1}>
        Remove Report Approval...
      </div>
    </Menu.Item>
    <Menu.Divider />
    <Menu.Item key="5">
      <div onClick={() => releaseReport(subjectId)} role="button" tabIndex={-1}>
        Release Report..
      </div>
    </Menu.Item>
    <Menu.Item key="6">
      <div onClick={() => holdReport(subjectId)} role="button" tabIndex={-1}>
        Hold Report...
      </div>
    </Menu.Item>
    <Menu.Item key="7">
      <div onClick={() => removeReleasedHoldStatus(subjectId)} role="button" tabIndex={-1}>
        Remove Report Hold/Release..
      </div>
    </Menu.Item>
    <Menu.Divider />
    <Menu.Item key="8">
      <div onClick={() => markEvaluationAsComplete(subjectId)} role="button" tabIndex={-1}>
        Mark As Done...
      </div>
    </Menu.Item>
    <Menu.Item key="9">
      <div onClick={() => unmarkEvaluationAsComplete(subjectId)} role="button" tabIndex={-1}>
        Unmark As Done...
      </div>
    </Menu.Item>
    <Menu.Divider />
    <Menu.Item key="10">
      <div onClick={() => removeSubject(subjectId)} role="button" tabIndex={-1}>
        Remove From Project...
      </div>
    </Menu.Item>
  </Menu>
)

export default ActionsMenu
