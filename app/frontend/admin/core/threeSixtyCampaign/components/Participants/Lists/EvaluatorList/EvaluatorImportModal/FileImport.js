import React from 'react'
import { Icon } from 'antd'
import ErrorAlertBox from 'admin/core/threeSixtyCampaign/components/common/ErrorAlertBox'

export default function FileImport ({
  setFile,
  errors,
  campaignId,
}) {
  return (
    <div>
      <div>
        Each row must have evalutors first name, last name, email and the email of subject to evaluate.
        <br />
        An evaluator may appear multiple times for different subjects.
        <br />
        All subjects must have already been added to the 360.
        <br />
        To define the relationship an evaluator has to a subject, enter it in a Relationship field.
      </div>
      <div className="mtm" style={{ fontSize: '16px' }}>
        <a
          href={`/administration/threesixty_campaigns/${campaignId}/evaluators/download_example_import_file`}
          target="blank"
        >
          <Icon type="cloud-download" />
          <span className="mls">Download Example csv</span>
        </a>
      </div>
      <div className="mtl">
        <input type="file" accept="text/csv" onChange={e => setFile(e.target.files[0])} />
      </div>
      <ErrorAlertBox errors={errors} />
    </div>
  )
}
