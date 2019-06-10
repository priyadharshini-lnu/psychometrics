import React from 'react'
import _ from 'lodash'
import { Alert } from 'antd'

export default function FileImport ({
  setFile,
  errors
}) {
  return (
    <div>
      <div>
        Each row must have a first name, last name and an email. Any other fields are optional.
        <br />
        If no password are provided then user would be sent a mail with a invite link where they can set a password.
        <br />
        Duplicate entries will be updated with any changes or additional fields.
      </div>
      <div className='mtl'>
        <input type='file' onChange={(e) => setFile(e.target.files[0])} />
      </div>
      {errors && (
        <Alert
          style={{ whiteSpace: 'pre' }}
          description={<ErrorMessage errors={errors} />}
          type="error"
          className="mtl"
          showIcon
        />
      )}
    </div>
  )
}

function ErrorMessage ({ errors }) {
  return <div>{_.values(errors).map(error => error.map((e, i) => <div key={i}>{e}</div>))}</div>
}
