import React from 'react'

interface Props {
  match: {
    params: {
      projectId: string,
      campaignId: string
    }
  }
}

const RegistrationCodes: React.FC<Props> = () => (
  <div>
    Registration Codes
  </div>
)

export default RegistrationCodes
