import React, { useEffect } from 'react'
import Modals from 'modules/admin/components/Modals/'
import { Row, Col } from 'antd'
import GroupFormModal from './GroupFormModal'
import GroupList from './GroupList'
import UngroupedList from './UngroupedList'

const MODALS = {
  GroupFormModal,
}
interface Props {
  fetch(campaignId: number): void
  match: {
    params: {
      campaignId: string
    }
  },
}

const Sequencing: React.FC<Props> = ({ fetch, match: { params: { campaignId } } }) => {
  const parsedCampaignId = parseInt(campaignId, 10)
  useEffect(() => {
    fetch(parsedCampaignId)
  }, [campaignId])
  return (
    <div className="pb24">
      <Row justify="space-between">
        <Col span={16}>
          <GroupList campaignId={parsedCampaignId} />
        </Col>
        <Col span={8}>
          <UngroupedList />
        </Col>
      </Row>
      <Modals modals={MODALS} />
    </div>
  )
}

export default Sequencing
