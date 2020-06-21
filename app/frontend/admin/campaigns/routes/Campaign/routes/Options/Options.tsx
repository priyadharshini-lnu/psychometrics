import React from 'react'

interface Props {
  match: {
    params: {
      projectId: string,
      campaignId: string
    }
  }
}

const Options: React.FC<Props> = () => (
  <div>
    Options
  </div>
)

export default Options
