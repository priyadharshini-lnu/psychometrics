import React from 'react'

interface Props {
  match: {
    params: {
      projectId: string,
      campaignId: string
    }
  }
}

const Users: React.FC<Props> = () => (
  <div>
      Users
  </div>
)


export default Users
